import { NextRequest, NextResponse } from 'next/server';
import { renderRizzlerHtml } from '@/lib/utils';

type PaymentInfo = {
  transaction?: string;
  network?: string;
  payer?: string;
  refundTransaction?: string;
  refundFailed?: boolean;
  premiumContent?: string;
  [key: string]: unknown;
};

function decodeBase64Json<T = unknown>(value: string): T {
  try {
    return JSON.parse(atob(value));
  } catch {
    // Fallback in case input is already JSON, not base64
    return JSON.parse(value);
  }
}

export async function handlePaidContentRequest(request: NextRequest, defaultNetwork: string, refundTxHash?: string) {
  const paymentResponseHeader = request.headers.get('x-payment-response');
  if (!paymentResponseHeader) {
    return NextResponse.json({ error: 'Payment info missing. Did you pay?' }, { status: 402 });
  }

  let paymentInfo: PaymentInfo;
  try {
    paymentInfo = decodeBase64Json<PaymentInfo>(paymentResponseHeader);
    if (!paymentInfo.network) {
      paymentInfo.network = defaultNetwork;
    }

    // premium content
    paymentInfo.premiumContent = "Have some rizz!";

    if (refundTxHash) {
      paymentInfo.refundTransaction = refundTxHash;
    }

  } catch (e) {
    console.error('Invalid payment info json.', e);
    return NextResponse.json({ error: 'Invalid payment info json.' }, { status: 500 });
  }

  const acceptHeader = request.headers.get('accept') || '';
  const userAgent = request.headers.get('user-agent') || '';
  const wantsHtml = acceptHeader.includes('text/html');
  const isBrowserUa = /(Mozilla|Chrome|Safari|Firefox|Edge|OPR|Edg)/i.test(userAgent) && !/(curl|wget|httpie|Postman|Insomnia|Go-http-client|node|node-fetch)/i.test(userAgent);

  if (wantsHtml || isBrowserUa) {
    const html = renderRizzlerHtml({
      transaction: paymentInfo.transaction || 'N/A',
      network: paymentInfo.network || defaultNetwork,
      payer: paymentInfo.payer || 'N/A'
    }, refundTxHash);
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Provide explicit refund status for non-browser clients
  if (refundTxHash === undefined) {
    paymentInfo.refundFailed = true;
  }

  return NextResponse.json(paymentInfo);
}


