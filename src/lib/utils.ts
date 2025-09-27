import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExplorerForNetwork(network: string) {
  if (network === 'base-sepolia') {
    return 'https://sepolia.basescan.org/tx/';
  } else if (network === 'base') {
    return 'https://basescan.org/tx/';
  } else if (network === 'solana-devnet') {
    return 'https://solscan.io/tx/';
  } else if (network === 'solana') {
    return 'https://solscan.io/tx/';
  } else if (network === 'avalanche') {
    return 'https://snowtrace.io/tx/';
  } else if (network === 'avalanche-fuji') {
    return 'https://testnet.snowtrace.io/tx/';
  } else if (network === 'sei') {
    return 'https://sei.explorer.dexscreener.com/tx/';
  } else if (network === 'sei-testnet') {
    return 'https://testnet.sei.explorer.dexscreener.com/tx/';
  } else if (network === 'polygon') {
    return 'https://polygonscan.com/tx/';
  } else if (network === 'polygon-amoy') {
    return 'https://amoy.polygonscan.com/tx/';
  }
}

export function renderRizzlerHtml(
  paymentResponse: { transaction: string, network: string, payer: string },
  refundTxHash?: string,
) {
  const paymentTx = paymentResponse.transaction || 'N/A';
  const refundFailed = !refundTxHash;

  // Determine explorer base URL
  let explorerBase = '';
  const isSolanaDevnet = paymentResponse.network === 'solana-devnet';
  if (paymentResponse.network === 'base-sepolia') {
    explorerBase = 'https://sepolia.basescan.org/tx/';
  } else if (paymentResponse.network === 'base') {
    explorerBase = 'https://basescan.org/tx/';
  }
  else if (paymentResponse.network === 'solana-devnet') {
    explorerBase = 'https://solscan.io/tx/';
  }
  else if (paymentResponse.network === 'solana') {
    explorerBase = 'https://solscan.io/tx/';
  }
  else if (paymentResponse.network === 'avalanche') {
    explorerBase = 'https://snowtrace.io/tx/';
  }
  else if (paymentResponse.network === 'avalanche-fuji') {
    explorerBase = 'https://testnet.snowtrace.io/tx/';
  }
  else if (paymentResponse.network === 'sei') {
    explorerBase = 'https://seistream.app/transactions/';
  }
  else if (paymentResponse.network === 'sei-testnet') {
    explorerBase = 'https://testnet.seistream.app/transactions/';
  }
  else if (paymentResponse.network === 'iotex') {
    explorerBase = 'https://iotexscan.io/tx/';
  }
  else if (paymentResponse.network === 'polygon') {
    explorerBase = 'https://polygonscan.com/tx/';
  }
  else if (paymentResponse.network === 'polygon-amoy') {
    explorerBase = 'https://amoy.polygonscan.com/tx/';
  }

  const paymentTxLink = paymentTx ? `${explorerBase}${paymentTx}${isSolanaDevnet ? '?cluster=devnet' : ''}` : null;
  const refundTxLink = refundTxHash
    ? `${explorerBase}${refundTxHash}${isSolanaDevnet ? '?cluster=devnet' : ''}`
    : null;

  const paymentResponseJson = JSON.stringify(paymentResponse, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Have some rizz!</title>
  <link rel="icon" href="/favicon.ico" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #fff; color: #222; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 0 10%; }
    .top-header { font-size: 1.3rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 1.5rem; letter-spacing: -0.5px; text-align: center; color: #4f46e5; }
    .header { font-size: 2.2rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 2rem; letter-spacing: -1px; text-align: center; }
    .gif { display: block; margin: 0 auto 2.5rem auto; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); width: 256px; height: auto; }
    .section { margin-bottom: 2.5rem; }
    .label { font-size: 1.1rem; font-weight: 500; color: #444; margin-bottom: 0.3rem; }
    .tx { font-family: Menlo, monospace; color: #4f46e5; font-size: 1rem; margin-bottom: 1.2rem; word-break: break-all; overflow-wrap: anywhere; }
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
    <div class="top-header">Thank you for your payment!</div>
    <div class="header">Have some rizz</div>
    <img src="/rizzler.gif" alt="rizzler gif" class="gif" />
    <div class="section"></div>
    <div class="section">
      <div class="label">Payment transaction:</div>
      <div class="tx">${paymentTxLink ? `<a href="${paymentTxLink}" class="tx-link" target="_blank" rel="noopener noreferrer">${paymentTx}</a>` : paymentTx}</div>
      <div class="label">Refund ${refundFailed ? 'status' : 'transaction'}:</div>
      <div class="tx refund">${refundFailed
        ? 'Refund failed'
        : `<a href="${refundTxLink}" class="tx-link" target="_blank" rel="noopener noreferrer">${refundTxHash}</a>`}
      </div>
    </div>
    <div class="section"></div>
    <div class="section">
      <div class="code-title">X-PAYMENT-RESPONSE HEADER</div>
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
