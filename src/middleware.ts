import { NextRequest, NextResponse } from "next/server";
import { Address, getAddress } from "viem";
import { exact } from "x402/schemes";
import {
  computeRoutePatterns,
  findMatchingPaymentRequirements,
  findMatchingRoute,
  processPriceToAtomicAmount,
  safeBase64Encode,
  toJsonSafe,
} from "x402/shared";
import { getLocalPaywallHtml } from "./paywall/getPaywallHtml";
import {
  FacilitatorConfig,
  moneySchema,
  ERC20TokenAmount,
  ExactSvmPayload,
  PaymentPayload,
  PaymentRequirements,
  Resource,
  RouteConfig,
  RoutesConfig,
  SupportedEVMNetworks,
  SupportedSVMNetworks
} from "x402/types";
import { type VerifyResponse } from "x402/types";
// eslint-disable-next-line react-hooks/rules-of-hooks
import { useFacilitator } from "x402/verify";
import { Network, SolanaAddress } from 'x402-next';
import { svm } from "x402/shared";
import { createSolanaRpc, decompileTransactionMessageFetchingLookupTables, getCompiledTransactionMessageDecoder } from "@solana/kit";
import { parseTransferCheckedInstruction } from "@solana-program/token-2022";
import { handlePaidContentRequest } from "./lib/paidContentHandler";

const { decodeTransactionFromPayload } = svm;
const facilitatorUrl = process.env.FACILITATOR_URL as `${string}://${string}`;
const payToEVM = process.env.EVM_RECEIVE_PAYMENTS_ADDRESS as `0x${string}`;
const payToSVM = process.env.SVM_RECEIVE_PAYMENTS_ADDRESS as SolanaAddress;

const solanaDevnetConfig = {
  price: '$0.01',
  network: 'solana-devnet' as Network,
  config: {
    description: 'Access to protected content on solana devnet'
  }
} as RouteConfig;

const solanaConfig = {
  price: '$0.01',
  network: 'solana' as Network,
  config: {
    description: 'Access to protected content on solana mainnet'
  }
} as RouteConfig;

const baseConfig = {
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

const polygonConfig = {
  price: '$0.01',
  network: 'polygon' as Network,
  config: {
    description: 'Access to protected content on polygon mainnet'
  }
} as RouteConfig;

const polygonAmoyConfig = {
  price: '$0.01',
  network: 'polygon-amoy' as Network,
  config: {
    description: 'Access to protected content on polygon amoy testnet'
  }
} as RouteConfig;

// middleware uses a payment config that is conditional
// based on which chain the client wants to transact on
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // solana devnet
  if (pathname.startsWith('/api/solana-devnet/')) {
    return paymentMiddleware(
      payToSVM,
      { '/api/solana-devnet/paid-content': solanaDevnetConfig },
      { url: facilitatorUrl }
    )(request);
  }

  // solana mainnet
  if (pathname.startsWith('/api/solana/')) {
    return paymentMiddleware(
      payToSVM,
      { '/api/solana/paid-content': solanaConfig },
      { url: facilitatorUrl }
    )(request);
  }

  // base mainnet
  if (pathname.startsWith('/api/base/')) {
    return paymentMiddleware(
      // payTo
      payToEVM,
      // routes
      {
        '/api/base/paid-content': baseConfig
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
      payToEVM,
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
      payToEVM,
      { '/api/avalanche/paid-content': avalancheConfig },
      {
        url: facilitatorUrl,
      }
    )(request);
  }

  // avalanche-fuji (testnet)
  if (pathname.startsWith('/api/avalanche-fuji/')) {
    return paymentMiddleware(
      payToEVM,
      { '/api/avalanche-fuji/paid-content': avalancheFujiConfig },
      {
        url: facilitatorUrl,
      }
    )(request);
  }

  // polygon mainnet
  if (pathname.startsWith('/api/polygon/')) {
    return paymentMiddleware(
      payToEVM,
      { '/api/polygon/paid-content': polygonConfig },
      {
        url: facilitatorUrl,
      }
    )(request);
  }

  // polygon-amoy (testnet)
  if (pathname.startsWith('/api/polygon-amoy/')) {
    return paymentMiddleware(
      payToEVM,
      { '/api/polygon-amoy/paid-content': polygonAmoyConfig },
      {
        url: facilitatorUrl,
      }
    )(request);
  }

  // sei mainnet
  if (pathname.startsWith('/api/sei/')) {
    return paymentMiddleware(
      payToEVM,
      { '/api/sei/paid-content': seiConfig },
      {
        url: facilitatorUrl,
      }
    )(request);
  }

  // sei-testnet
  if (pathname.startsWith('/api/sei-testnet/')) {
    return paymentMiddleware(
      payToEVM,
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
  payTo: Address | SolanaAddress,
  routes: RoutesConfig,
  facilitator?: FacilitatorConfig,
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { verify, settle, supported } = useFacilitator(facilitator);
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
    const { description, mimeType, maxTimeoutSeconds, outputSchema, customPaywallHtml, resource, discoverable, inputSchema, errorMessages } =
      config;

    const atomicAmountForAsset = processPriceToAtomicAmount(price, network);
    if ("error" in atomicAmountForAsset) {
      return new NextResponse(atomicAmountForAsset.error, { status: 500 });
    }
    const { maxAmountRequired, asset } = atomicAmountForAsset;

    const resourceUrl =
      resource || (`${request.nextUrl.protocol}//${request.nextUrl.host}${pathname}` as Resource);


    const paymentRequirements: PaymentRequirements[] = [];
    
    if (SupportedEVMNetworks.includes(network)) {
      paymentRequirements.push({
        scheme: "exact",
        network,
        maxAmountRequired,
        resource: resourceUrl,
        description: description ?? "",
        mimeType: mimeType ?? "application/json",
        payTo: getAddress(payTo),
        maxTimeoutSeconds: maxTimeoutSeconds ?? 300,
        asset: getAddress(asset.address),
        // TODO: Rename outputSchema to requestStructure
        outputSchema: {
          input: {
            type: "http",
            method,
            discoverable: discoverable ?? true,
            ...inputSchema,
          },
          output: outputSchema,
        },
        extra: (asset as ERC20TokenAmount["asset"]).eip712,
      });
    }
    // svm networks
    else if (SupportedSVMNetworks.includes(network)) {
      // network call to get the supported payments from the facilitator
      const paymentKinds = await supported();

      // find the payment kind that matches the network and scheme
      let feePayer: string | undefined;
      for (const kind of paymentKinds.kinds) {
        if (kind.network === network && kind.scheme === "exact") {
          feePayer = kind?.extra?.feePayer;
          break;
        }
      }

      // svm networks require a fee payer
      if (!feePayer) {
        throw new Error(`The facilitator did not provide a fee payer for network: ${network}.`);
      }

      // build the payment requirements for svm
      paymentRequirements.push({
        scheme: "exact",
        network,
        maxAmountRequired,
        resource: resourceUrl,
        description: description ?? "",
        mimeType: mimeType ?? "",
        payTo: payTo,
        maxTimeoutSeconds: maxTimeoutSeconds ?? 60,
        asset: asset.address,
        // TODO: Rename outputSchema to requestStructure
        outputSchema: {
          input: {
            type: "http",
            method,
            ...inputSchema,
          },
          output: outputSchema,
        },
        extra: {
          feePayer,
        },
      });
    } else {
      throw new Error(`Unsupported network: ${network}`);
    }

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
            getLocalPaywallHtml({
              amount: displayAmount,
              paymentRequirements: toJsonSafe(paymentRequirements) as Parameters<
                typeof getLocalPaywallHtml
              >[0]["paymentRequirements"],
              currentUrl: request.url,
              testnet: network === "base-sepolia" || network === "avalanche-fuji" || network === "sei-testnet" || network === "polygon-amoy",
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
    const verification: VerifyResponse = await verify(decodedPayment, selectedPaymentRequirements);

    if (!verification.isValid) {
      return new NextResponse(
        JSON.stringify({
          x402Version,
          error: errorMessages?.verificationFailed || verification.invalidReason,
          accepts: paymentRequirements,
          payer: verification.payer,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }

    // Proceed with request
    const response = NextResponse.next();

    // if the response from the protected route is >= 400, do not settle the payment
    if (response.status >= 400) {
      return response;
    }

    // Settle payment after response via API route
    try {
      const settlement = await settle(decodedPayment, selectedPaymentRequirements);

      if (settlement.success) {
        // need to get the actual payer for the tx, currently the x402 package has a bug
        // TODO change this once the x402 package is fixed
        let payer: string;
        let svmContext: {
          mint: string;
          sourceTokenAccount: string;
          destinationTokenAccount: string;
          decimals: number;
          tokenProgram?: string;
        } | undefined;
        if (SupportedSVMNetworks.includes(settlement.network)) {
          const rpcUrl = settlement.network === 'solana-devnet'
            ? (process.env.SOLANA_DEVNET_RPC_URL ?? 'https://api.devnet.solana.com')
            : (process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com');
          const rpc = createSolanaRpc(rpcUrl);
          const encodedSolanaTx = await decodeTransactionFromPayload(decodedPayment.payload as ExactSvmPayload);
          const compiledTransactionMessage = getCompiledTransactionMessageDecoder().decode(
            encodedSolanaTx.messageBytes,
          );
          const txMessage = await decompileTransactionMessageFetchingLookupTables(
            compiledTransactionMessage,
            rpc,
          );
          type TransferCheckedIx = {
            accounts: {
              authority: { address: string };
              mint: { address: string };
              destination: { address: string };
              source: { address: string };
            };
            data: { decimals: number };
            programAddress: string;
          };
          const ixIndex = txMessage.instructions.length > 3 ? 3 : 2;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transferIx = parseTransferCheckedInstruction(txMessage.instructions[ixIndex] as any) as unknown as TransferCheckedIx;
          payer = transferIx.accounts.authority.address;
          // Build svmContext for refund API
          svmContext = {
            mint: transferIx.accounts.mint.address,
            // reverse source/destination for refund
            sourceTokenAccount: transferIx.accounts.destination.address,
            destinationTokenAccount: transferIx.accounts.source.address,
            decimals: transferIx.data.decimals,
            tokenProgram: transferIx.programAddress,
          };
        }
        else {
          payer = settlement.payer || "";
        }

        const responseHeaderData = {
          success: true,
          transaction: settlement.transaction,
          network: settlement.network,
          payer,
        };
        const paymentResponseHeader = safeBase64Encode(
          JSON.stringify(responseHeaderData),
        );
        response.headers.set(
          "X-PAYMENT-RESPONSE",
          paymentResponseHeader,
        );

        if (!payer || payer === "") {
          return response;
        }
        
        // refund the payment via Node API route for EVM only in this branch
        const apiUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/facilitator/refund`;
        const refundResp = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipient: payer, selectedPaymentRequirements, svmContext }),
        });
        if (refundResp.ok) {
          const { refundTxHash } = await refundResp.json();
          // Build a request for the paidContentHandler with the payment info header
          const forwardHeaders = new Headers();
          // preserve content negotiation and user agent
          const acceptHeader = request.headers.get('accept');
          const userAgentHeader = request.headers.get('user-agent');
          if (acceptHeader) forwardHeaders.set('accept', acceptHeader);
          if (userAgentHeader) forwardHeaders.set('user-agent', userAgentHeader);
          forwardHeaders.set('x-payment-response', paymentResponseHeader);
          const handlerRequest = new NextRequest(request.url, { headers: forwardHeaders, method: 'GET' });
          // Use the configured network for default display
          const handlerResponse = await handlePaidContentRequest(handlerRequest, network as unknown as string, refundTxHash);
          // ensure the client still receives the payment response header
          handlerResponse.headers.set('X-PAYMENT-RESPONSE', paymentResponseHeader);
          return handlerResponse;
        } else {
          // Forward to handler without refundTxHash to indicate failure
          const forwardHeaders = new Headers();
          const acceptHeader = request.headers.get('accept');
          const userAgentHeader = request.headers.get('user-agent');
          if (acceptHeader) forwardHeaders.set('accept', acceptHeader);
          if (userAgentHeader) forwardHeaders.set('user-agent', userAgentHeader);
          forwardHeaders.set('x-payment-response', paymentResponseHeader);
          forwardHeaders.set('x-refund-failed', 'true');
          const handlerRequest = new NextRequest(request.url, { headers: forwardHeaders, method: 'GET' });
          const handlerResponse = await handlePaidContentRequest(handlerRequest, network as unknown as string);
          handlerResponse.headers.set('X-PAYMENT-RESPONSE', paymentResponseHeader);
          return handlerResponse;
        }
      }
      else {
        return new NextResponse(
          JSON.stringify({
            x402Version,
            error: "Settlement failed",
            accepts: paymentRequirements,
          }),
        );
      }
    } catch (error) {
      console.error("error", error);

      return new NextResponse(
        JSON.stringify({
          x402Version,
          error:
            errorMessages?.settlementFailed ||
            (error instanceof Error ? error : "Settlement failed"),
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
    '/api/solana-devnet/paid-content/:path*',
    '/api/solana/paid-content/:path*',
    '/api/base/paid-content/:path*',
    '/api/base-sepolia/paid-content/:path*',
    '/api/avalanche/paid-content/:path*',
    '/api/avalanche-fuji/paid-content/:path*',
    '/api/polygon/paid-content/:path*',
    '/api/polygon-amoy/paid-content/:path*',
    '/api/sei/paid-content/:path*',
    '/api/sei-testnet/paid-content/:path*',
  ]
};