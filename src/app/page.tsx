import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">x402 Echo Server Demo</h1>
        <p className="mb-6 text-lg text-gray-200">
          Welcome! This is a demo Next.js app showing how to use the <a href="https://x402.org" className="underline text-blue-400" target="_blank" rel="noopener noreferrer">x402 protocol</a> for pay-per-use APIs.<br/>
          Developers can test their x402 clients against the <code className="bg-gray-800 text-white px-2 py-1 rounded">/api/paid-content</code> endpoint.
        </p>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-white">How it works</h2>
          <ul className="text-left list-disc list-inside text-base mb-2 text-gray-200">
            <li>Make a request to <code className="bg-gray-800 text-white px-1 rounded">/api/paid-content</code> with a valid x402 payment header.</li>
            <li>If payment is valid, you unlock a fun Rizzler GIF and your funds are refunded 100%!</li>
            <li>If payment is missing or invalid, you get a 402 Payment Required response.</li>
          </ul>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-white">Example request</h2>
          <pre className="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto text-left">
{`curl -i \
  -H "X-PAYMENT: <your-x402-payment-header>" \
  https://<your-vercel-deployment>/api/paid-content`}
          </pre>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-white">Learn more</h2>
          <a href="https://x402.org" className="underline text-blue-400" target="_blank" rel="noopener noreferrer">x402.org</a>
        </div>
      </div>
    </main>
  );
}
