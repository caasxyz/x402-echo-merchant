import { NextRequest, NextResponse } from 'next/server';

// a basic GET route that returns a message
export const GET = async (request: NextRequest) => {
  // Get payment/refund info from the X-PAYMENT-RESPONSE header
  const paymentResponseHeader = request.headers.get('x-payment-response');
  if (!paymentResponseHeader) {
    return NextResponse.json({
      error: 'Payment info missing. Did you pay?'
    }, { status: 402 });
  }

  let paymentInfo;
  try {
    paymentInfo = JSON.parse(paymentResponseHeader);
  } catch (e) {
    return NextResponse.json({
      error: 'Invalid payment info format.'
    }, { status: 500 });
  }

  return NextResponse.json({
    gifUrl: '/rizzler.gif',
    payment: paymentInfo
  });
};