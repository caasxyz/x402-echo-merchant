import { NextRequest, NextResponse } from 'next/server';
import { useFacilitator } from 'x402/verify';
import { facilitator } from "@coinbase/x402";

export async function POST(request: NextRequest) {
  const { paymentPayload, paymentRequirements, facilitatorConfig } = await request.json();
  const { settle } = useFacilitator(facilitatorConfig);
  const result = await settle(paymentPayload, paymentRequirements);
  console.log("result", result);
  return NextResponse.json(result);
} 