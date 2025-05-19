import { NextRequest, NextResponse } from 'next/server';
import { facilitator } from "@coinbase/x402";
import { toJsonSafe } from "x402/shared";

export async function POST(request: NextRequest) {
  const { paymentPayload, paymentRequirements } = await request.json();

  // create the facilitator based on the network used
  let facilitatorConfig;
  if (paymentRequirements.network === "base-sepolia") {
    facilitatorConfig = {
      url: "https://x402.org/facilitator" as `https://${string}`,
    } as const;
  } else {
    facilitatorConfig = facilitator;
  }

  // get the url and headers for the facilitator
  const url = facilitator?.url || "https://x402.org/facilitator";
  const headers = facilitator?.createAuthHeaders
    ? (await facilitator.createAuthHeaders()).verify
    : {};

  // set the content type to json -- this should be fixed in the x402 library
  headers["Content-Type"] ="application/json";
  
  // make the request to the facilitator
  const res = await fetch(`${url}/verify`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      x402Version: paymentPayload.x402Version,
      paymentPayload: toJsonSafe(paymentPayload),
      paymentRequirements: toJsonSafe(paymentRequirements),
    }),
  });

  // get the response from the facilitator
  const data = await res.json();

  // forward the response from the facilitator
  return NextResponse.json(data, { status: res.status });
}