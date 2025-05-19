import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function renderRizzlerHtml(paymentResponse: any, refundResult: any) {
  const paymentTx = paymentResponse.transaction || 'N/A';
  const refundTx = refundResult || 'N/A';

  // Determine explorer base URL
  let explorerBase = '';
  if (paymentResponse.network === 'base-sepolia') {
    explorerBase = 'https://sepolia.basescan.org/tx/';
  } else if (paymentResponse.network === 'base') {
    explorerBase = 'https://basescan.org/tx/';
  }
  const paymentTxLink = paymentTx ? `${explorerBase}${paymentTx}` : null;
  const refundTxLink = refundTx ? `${explorerBase}${refundTx}` : null;

  const paymentResponseJson = JSON.stringify(paymentResponse, null, 2);

  return `<!DOCTYPE html>
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
}
