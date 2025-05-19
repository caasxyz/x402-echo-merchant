import { NextRequest, NextResponse } from 'next/server';
import { useFacilitator } from 'x402/verify';
import { facilitator } from "@coinbase/x402";

export async function POST(request: NextRequest) {
  const { paymentPayload, paymentRequirements } = await request.json();

  const { verify } = useFacilitator(facilitator);

  console.log("Inside verify route");
  console.dir(paymentPayload, { depth: null });
  console.dir(paymentRequirements, { depth: null });
  paymentRequirements["outputSchema"] = undefined;

  const result = await verify(paymentPayload, paymentRequirements);
  console.log("result", result);
  return NextResponse.json(result);
}