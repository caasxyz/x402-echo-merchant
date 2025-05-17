import { paymentMiddleware, Network } from 'x402-next';
import { facilitator } from "@coinbase/x402";
import { NextRequest, NextResponse } from 'next/server';

const mainnetConfig = {
  price: '$0.01',
  network: "base" as Network,
  config: {
    description: 'Access to protected content on mainnet'
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
  if (pathname.startsWith('/api/mainnet')) {
    return paymentMiddleware(
      // payTo
      process.env.ADDRESS as `0x${string}`,
      // routes
      {
        '/api/mainnet/paid-content': mainnetConfig
      },
      facilitator
    )(request);
  }
  
  // base-sepolia
  if (pathname.startsWith('/api/base-sepolia')) {
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

export const config = {
  matcher: [
    '/api/mainnet/paid-content/:path*',
    '/api/base-sepolia/paid-content/:path*',
  ]
};