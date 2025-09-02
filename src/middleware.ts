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
  RouteConfig,
  RoutesConfig,
} from "x402/types";
import { Network } from 'x402-next';
import { refund } from "./refund";
import { renderRizzlerHtml } from "./lib/utils";

const facilitatorUrl = process.env.FACILITATOR_URL as `${string}://${string}`;

const mainnetConfig = {
  price: '$0.01',
  network: "base" as Network,
  config: {
    description: 'Access to protected content on base mainnet'
  }
} as RouteConfig;

const sepoliaConfig = {
  price: '$0.01',
  network: 'base-sepolia' as Network,
  config: {
    description: 'Access to protected content on base-sepolia'
  }
} as RouteConfig;

const avalancheConfig = {
  price: '$0.01',
  network: 'avalanche' as Network,
  config: {
    description: 'Access to protected content on avalanche mainnet'
  }
} as RouteConfig;

const avalancheFujiConfig = {
  price: '$0.01',
  network: 'avalanche-fuji' as Network,
  config: {
    description: 'Access to protected content on avalanche-fuji'
  }
} as RouteConfig;

const seiConfig = {
  price: '$0.01',
  network: 'sei' as Network,
  config: {
    description: 'Access to protected content on sei mainnet'
  }
} as RouteConfig;

const seiTestnetConfig = {
  price: '$0.01',
  network: 'sei-testnet' as Network,
  config: {
    description: 'Access to protected content on sei-testnet'
  }
} as RouteConfig;

// middleware uses a payment config that is conditional
// based on which chain the client wants to transact on
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // mainnet
  if (pathname.startsWith('/api/base/')) {
    return paymentMiddleware(
      // payTo
      process.env.RECEIVE_PAYMENTS_ADDRESS as `0x${string}`,
      // routes
      {
        '/api/base/paid-content': mainnetConfig
      },
      {
        url: facilitatorUrl,
      }
    )(request);
  }
  
  // base-sepolia
  if (pathname.startsWith('/api/base-sepolia/')) {
    return paymentMiddleware(
      // payTo
      process.env.RECEIVE_PAYMENTS_ADDRESS as `0x${string}`,
      // routes
      { '/api/base-sepolia/paid-content': sepoliaConfig },
      // facilitator
      {
        url: facilitatorUrl,
      }
    )(request);
  }
  
  // avalanche mainnet
  if (pathname.startsWith('/api/avalanche/')) {
    return paymentMiddleware(
      process.env.RECEIVE_PAYMENTS_ADDRESS as `0x${string}`,
      { '/api/avalanche/paid-content': avalancheConfig },
      {
        url: facilitatorUrl,
      }
    )(request);
  }

  // avalanche-fuji (testnet)
  if (pathname.startsWith('/api/avalanche-fuji/')) {
    return paymentMiddleware(
      process.env.RECEIVE_PAYMENTS_ADDRESS as `0x${string}`,
      { '/api/avalanche-fuji/paid-content': avalancheFujiConfig },
      {
        url: facilitatorUrl,
      }
    )(request);
  }

  // sei mainnet
  if (pathname.startsWith('/api/sei/')) {
    return paymentMiddleware(
      process.env.RECEIVE_PAYMENTS_ADDRESS as `0x${string}`,
      { '/api/sei/paid-content': seiConfig },
      {
        url: facilitatorUrl,
      }
    )(request);
  }

  // sei-testnet
  if (pathname.startsWith('/api/sei-testnet/')) {
    return paymentMiddleware(
      process.env.RECEIVE_PAYMENTS_ADDRESS as `0x${string}`,
      { '/api/sei-testnet/paid-content': seiTestnetConfig },
      {
        url: facilitatorUrl,
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

    // Verify payment via API route
    const verifyRes = await fetch(`${request.nextUrl.origin}/api/facilitator/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentPayload: decodedPayment,
        paymentRequirements: selectedPaymentRequirements,
      }),
    });
    const verification = await verifyRes.json();
    
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

    // Settle payment after response via API route
    try {
      const settleRes = await fetch(`${request.nextUrl.origin}/api/facilitator/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentPayload: decodedPayment,
          paymentRequirements: selectedPaymentRequirements,
          facilitatorConfig: facilitator,
        }),
      });
      const settlement = await settleRes.json();

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
        
        // build the html response
        const html = renderRizzlerHtml(paymentResponse, refundResult);

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
    '/api/avalanche/paid-content/:path*',
    '/api/avalanche-fuji/paid-content/:path*',
    '/api/sei/paid-content/:path*',
    '/api/sei-testnet/paid-content/:path*',
  ]
};