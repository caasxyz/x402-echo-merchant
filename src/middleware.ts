import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Address } from "viem";
import { exact } from "x402/schemes";
import {
  computeRoutePatterns,
  findMatchingPaymentRequirements,
  findMatchingRoute,
  getPaywallHtml,
  processPriceToAtomicAmount,
  toJsonSafe,
} from "x402/shared";
import {
  FacilitatorConfig,
  moneySchema,
  PaymentPayload,
  PaymentRequirements,
  Resource,
  RoutesConfig,
} from "x402/types";
import { useFacilitator } from "x402/verify";
import { Network } from 'x402-next';
import { facilitator } from "@coinbase/x402";
import { refund } from "./refund";

const mainnetConfig = {
  price: '$0.01',
  network: "base" as Network,
  config: {
    description: 'Access to protected content on base mainnet'
  }
};

const sepoliaConfig = {
  price: '$0.01',
  network: 'base-sepolia' as Network,
  config: {
    description: 'Access to protected content on base-sepolia'
  }
};

// middleware uses a payment config that is conditional
// based on which chain the client wants to transact on
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // mainnet
  if (pathname.startsWith('/api/base/')) {
    return paymentMiddleware(
      // payTo
      process.env.ADDRESS as `0x${string}`,
      // routes
      {
        '/api/base/paid-content': mainnetConfig
      },
      facilitator
    )(request);
  }
  
  // base-sepolia
  if (pathname.startsWith('/api/base-sepolia/')) {
    return paymentMiddleware(
      // payTo
      process.env.ADDRESS as `0x${string}`,
      // routes
      { '/api/base-sepolia/paid-content': sepoliaConfig },
      // facilitator
      {
        url: "https://x402.org/facilitator",
      }
    )(request);
  }
  
  // if not matched, continue without payment enforcement
  return NextResponse.next();
}


/**
 * Creates a payment middleware factory for Next.js
 *
 * @param payTo - The address to receive payments
 * @param routes - Configuration for protected routes and their payment requirements
 * @param facilitator - Optional configuration for the payment facilitator service
 * @returns A Next.js middleware handler
 *
 * @example
 * ```typescript
 * // Simple configuration - All endpoints are protected by $0.01 of USDC on base-sepolia
 * export const middleware = paymentMiddleware(
 *   '0x123...', // payTo address
 *   {
 *     price: '$0.01', // USDC amount in dollars
 *     network: 'base-sepolia'
 *   },
 *   // Optional facilitator configuration. Defaults to x402.org/facilitator for testnet usage
 * );
 *
 * // Advanced configuration - Endpoint-specific payment requirements & custom facilitator
 * export const middleware = paymentMiddleware(
 *   '0x123...', // payTo: The address to receive payments
 *   {
 *     '/protected/*': {
 *       price: '$0.001', // USDC amount in dollars
 *       network: 'base',
 *       config: {
 *         description: 'Access to protected content'
 *       }
 *     },
 *     '/api/premium/*': {
 *       price: {
 *         amount: '100000',
 *         asset: {
 *           address: '0xabc',
 *           decimals: 18,
 *           eip712: {
 *             name: 'WETH',
 *             version: '1'
 *           }
 *         }
 *       },
 *       network: 'base'
 *     }
 *   },
 *   {
 *     url: 'https://facilitator.example.com',
 *     createAuthHeaders: async () => ({
 *       verify: { "Authorization": "Bearer token" },
 *       settle: { "Authorization": "Bearer token" }
 *     })
 *   }
 * );
 * ```
 */
export function paymentMiddleware(
  payTo: Address,
  routes: RoutesConfig,
  facilitator?: FacilitatorConfig,
) {
  const { verify, settle } = useFacilitator(facilitator);
  const x402Version = 1;

  // Pre-compile route patterns to regex and extract verbs
  const routePatterns = computeRoutePatterns(routes);

  return async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const method = request.method.toUpperCase();

    // Find matching route configuration
    const matchingRoute = findMatchingRoute(routePatterns, pathname, method);

    if (!matchingRoute) {
      return NextResponse.next();
    }

    const { price, network, config = {} } = matchingRoute.config;
    const { description, mimeType, maxTimeoutSeconds, outputSchema, customPaywallHtml, resource } =
      config;

    const atomicAmountForAsset = processPriceToAtomicAmount(price, network);
    if ("error" in atomicAmountForAsset) {
      return new NextResponse(atomicAmountForAsset.error, { status: 500 });
    }
    const { maxAmountRequired, asset } = atomicAmountForAsset;

    const resourceUrl =
      resource || (`${request.nextUrl.protocol}//${request.nextUrl.host}${pathname}` as Resource);
    const paymentRequirements: PaymentRequirements[] = [
      {
        scheme: "exact",
        network,
        maxAmountRequired,
        resource: resourceUrl,
        description: description ?? "",
        mimeType: mimeType ?? "application/json",
        payTo,
        maxTimeoutSeconds: maxTimeoutSeconds ?? 300,
        asset: asset?.address ?? "",
        outputSchema,
        extra: asset?.eip712,
      },
    ];

    // Check for payment header
    const paymentHeader = request.headers.get("X-PAYMENT");
    if (!paymentHeader) {
      const accept = request.headers.get("Accept");
      if (accept?.includes("text/html")) {
        const userAgent = request.headers.get("User-Agent");
        if (userAgent?.includes("Mozilla")) {
          let displayAmount: number;
          if (typeof price === "string" || typeof price === "number") {
            const parsed = moneySchema.safeParse(price);
            if (parsed.success) {
              displayAmount = parsed.data;
            } else {
              displayAmount = Number.NaN;
            }
          } else {
            displayAmount = Number(price.amount) / 10 ** price.asset.decimals;
          }

          const html =
            customPaywallHtml ??
            getPaywallHtml({
              amount: displayAmount,
              paymentRequirements: toJsonSafe(paymentRequirements) as Parameters<
                typeof getPaywallHtml
              >[0]["paymentRequirements"],
              currentUrl: request.url,
              testnet: network === "base-sepolia",
            });
          return new NextResponse(html, {
            status: 402,
            headers: { "Content-Type": "text/html" },
          });
        }
      }

      return new NextResponse(
        JSON.stringify({
          x402Version,
          error: "X-PAYMENT header is required",
          accepts: paymentRequirements,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    // Verify payment
    let decodedPayment: PaymentPayload;
    try {
      decodedPayment = exact.evm.decodePayment(paymentHeader);
      decodedPayment.x402Version = x402Version;
    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          x402Version,
          error: error instanceof Error ? error : "Invalid payment",
          accepts: paymentRequirements,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    const selectedPaymentRequirements = findMatchingPaymentRequirements(
      paymentRequirements,
      decodedPayment,
    );
    if (!selectedPaymentRequirements) {
      return new NextResponse(
        JSON.stringify({
          x402Version,
          error: "Unable to find matching payment requirements",
          accepts: toJsonSafe(paymentRequirements),
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    const verification = await verify(decodedPayment, selectedPaymentRequirements);
    
    if (!verification.isValid) {
      return new NextResponse(
        JSON.stringify({
          x402Version,
          error: verification.invalidReason,
          accepts: paymentRequirements,
          payer: verification.payer,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    // Proceed with request
    const response = await NextResponse.next();

    // Settle payment after response
    try {
      const settlement = await settle(decodedPayment, selectedPaymentRequirements);

      if (settlement.success) {
        // refund the payment
        const refundResult = await refund(
          decodedPayment.payload.authorization.from,
          selectedPaymentRequirements
        );

        // prepare response data
        const paymentResponse = {
          success: true,
          transaction: settlement.transaction,
          network: settlement.network,
          payer: settlement.payer,
        };
        const paymentResponseJson = JSON.stringify(paymentResponse, null, 2);

        // build the html response
        const paymentTx = settlement.transaction || 'N/A';
        const refundTx = refundResult || 'N/A';

        // Determine explorer base URL
        let explorerBase = '';
        if (settlement.network === 'base-sepolia') {
          explorerBase = 'https://sepolia.basescan.org/tx/';
        } else if (settlement.network === 'base') {
          explorerBase = 'https://basescan.org/tx/';
        }
        const paymentTxLink = paymentTx ? `${explorerBase}${paymentTx}` : null;
        const refundTxLink = refundTx ? `${explorerBase}${refundTx}` : null;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Enjoy the rizz</title>
  <link rel="icon" href="/favicon.ico" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #fff; color: #222; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 0 10%; }
    .header { font-size: 2.2rem; font-weight: 600; margin-top: 3rem; margin-bottom: 2rem; letter-spacing: -1px; text-align: center; }
    .gif { display: block; margin: 0 auto 2.5rem auto; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); width: 256px; height: auto; }
    .section { margin-bottom: 2.5rem; }
    .label { font-size: 1.1rem; font-weight: 500; color: #444; margin-bottom: 0.3rem; }
    .tx { font-family: Menlo, monospace; color: #4f46e5; font-size: 1rem; margin-bottom: 1.2rem; }
    .refund { color: #ec4899; }
    .code-title { font-weight: 600; color: #444; margin-bottom: 0.5rem; }
    .code-block { background: #f3f4f6; border-radius: 8px; padding: 1rem; font-family: Menlo, monospace; font-size: 0.95rem; color: #222; overflow-x: auto; margin-bottom: 2.5rem; }
    .back-link { display: inline-block; margin: 1.5rem auto 0 auto; padding: 0.7rem 2rem; background: #4f46e5; color: #fff; border-radius: 6px; font-weight: 500; text-decoration: none; box-shadow: 0 2px 8px rgba(79,70,229,0.07); transition: background 0.2s; text-align: center; }
    .back-link:hover { background: #3730a3; }
    .footer { width: 100%; padding: 2rem 0 1rem 0; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 0.98rem; margin-top: 3rem; }
    .footer-heart { color: #ec4899; font-size: 1.1em; vertical-align: middle; margin: 0 0.2em; }
    .tx-link { color: inherit; text-decoration: none; }
    .tx-link:hover { text-decoration: underline; }
    @media (max-width: 700px) { .container { padding: 0 4%; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Enjoy the rizz</div>
    <img src="/rizzler.gif" alt="rizzler gif" class="gif" />
    <div class="section"></div>
    <div class="section">
      <div class="label">Payment transaction:</div>
      <div class="tx">${paymentTxLink ? `<a href="${paymentTxLink}" class="tx-link" target="_blank" rel="noopener noreferrer">${paymentTx}</a>` : paymentTx}</div>
      <div class="label">Refund transaction:</div>
      <div class="tx refund">${refundTxLink ? `<a href="${refundTxLink}" class="tx-link" target="_blank" rel="noopener noreferrer">${refundTx}</a>` : refundTx}</div>
    </div>
    <div class="section"></div>
    <div class="section">
      <div class="code-title">X-PAYMENT-RESPONSE</div>
      <div class="code-block"><pre><code>${paymentResponseJson}</code></pre></div>
    </div>
    <a href="/" class="back-link">Back to Home</a>
    <div class="footer">
      Made with <span class="footer-heart">&lt;3</span> by <a href="https://payai.network" target="_blank" rel="noopener noreferrer" style="color:#4f46e5;text-decoration:underline;">PayAI</a>
    </div>
  </div>
</body>
</html>`;

        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            'X-PAYMENT-RESPONSE': JSON.stringify(paymentResponse)
          }
        });
      }
    } catch (error) {
      console.error("error", error);

      return new NextResponse(
        JSON.stringify({
          x402Version,
          error: error instanceof Error ? error : "Settlement failed",
          accepts: paymentRequirements,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    return response;
  };
}

export const config = {
  matcher: [
    '/api/base/paid-content/:path*',
    '/api/base-sepolia/paid-content/:path*',
  ]
};