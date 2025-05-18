'use client';
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Home() {
  // Collapsible state for each endpoint
  const [open, setOpen] = useState({
    'base-sepolia': false,
    base: false,
  });

  const toggle = (key: 'base-sepolia' | 'base') =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <div className="max-w-2xl w-full text-center py-24">
        <h1 className="text-5xl font-extrabold mb-6 text-white tracking-tight">x402 Echo Server</h1>
        <p className="mb-8 text-2xl text-gray-200 font-light">
          Instantly test the <span className="text-blue-400 font-semibold">x402 protocol</span> for pay-per-use APIs.<br/>
          Live endpoints. Real payments.<span className="text-green-400">100% refunds.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <a
            href="#playground"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-lg transition"
          >
            🚀 Try It Now
          </a>
          <a
            href="https://x402.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-lg transition border border-gray-700"
          >
            📖 View Docs
          </a>
        </div>
        <div className="text-gray-400 text-base">
          <span>Open source • Powered by <a href="https://x402.org" className="underline text-blue-400" target="_blank" rel="noopener noreferrer">x402</a></span>
        </div>
      </div>
      {/* Endpoint Reference Table */}
      <section className="w-full max-w-3xl bg-gray-900 rounded-xl shadow-lg p-8 mt-0 mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Endpoint Reference</h2>
        <table className="w-full text-left mb-4">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="py-2 px-3">Endpoint</th>
              <th className="py-2 px-3">Method</th>
              <th className="py-2 px-3">Description</th>
              <th className="py-2 px-3">Examples</th>
            </tr>
          </thead>
          <tbody className="text-gray-200 text-base">
            <tr className="border-t border-gray-800">
              <td className="py-2 px-3 font-mono">/api/base-sepolia/paid-content</td>
              <td className="py-2 px-3">GET</td>
              <td className="py-2 px-3">Echo endpoint (Base Sepolia testnet)</td>
              <td className="py-2 px-3">
                <button
                  className="underline text-blue-400 hover:text-blue-300 text-sm"
                  onClick={() => toggle('base-sepolia')}
                >
                  {open['base-sepolia'] ? 'Hide' : 'Show'}
                </button>
              </td>
            </tr>
            {open['base-sepolia'] && (
              <tr>
                <td colSpan={4} className="bg-gray-800 rounded p-4">
                  <div className="mb-2 font-semibold text-green-400">Sample 200 Response</div>
                  <pre className="bg-gray-950 text-white p-3 rounded text-sm overflow-x-auto mb-4">{`HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"message": "Hello, world!"}`}</pre>
                  <div className="mb-2 font-semibold text-yellow-400">Sample 402 Response</div>
                  <pre className="bg-gray-950 text-white p-3 rounded text-sm overflow-x-auto">{`HTTP/1.1 402 Payment Required\nContent-Type: application/json\n\n{"error": "Payment Required"}`}</pre>
                </td>
              </tr>
            )}
            <tr className="border-t border-gray-800">
              <td className="py-2 px-3 font-mono">/api/mainnet/paid-content</td>
              <td className="py-2 px-3">GET</td>
              <td className="py-2 px-3">Echo endpoint (Base mainnet)</td>
              <td className="py-2 px-3">
                <button
                  className="underline text-blue-400 hover:text-blue-300 text-sm"
                  onClick={() => toggle('base')}
                >
                  {open.base ? 'Hide' : 'Show'}
                </button>
              </td>
            </tr>
            {open.base && (
              <tr>
                <td colSpan={4} className="bg-gray-800 rounded p-4">
                  <div className="mb-2 font-semibold text-green-400">Sample 200 Response</div>
                  <pre className="bg-gray-950 text-white p-3 rounded text-sm overflow-x-auto mb-4">{`HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"message": "Hello, world!"}`}</pre>
                  <div className="mb-2 font-semibold text-yellow-400">Sample 402 Response</div>
                  <pre className="bg-gray-950 text-white p-3 rounded text-sm overflow-x-auto">{`HTTP/1.1 402 Payment Required\nContent-Type: application/json\n\n{"error": "Payment Required"}`}</pre>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      {/* Quickstart Code Snippets */}
      <section className="w-full max-w-3xl bg-gray-900 rounded-xl shadow-lg p-8 mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Quickstart Code Snippets</h2>
        <QuickstartTabs />
      </section>
    </main>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs flex items-center gap-1 transition"
      aria-label="Copy code"
      type="button"
    >
      {copied ? (
        <span>Copied!</span>
      ) : (
        <>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle"><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2"/><rect x="3" y="3" width="13" height="13" rx="2" strokeWidth="2"/></svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function QuickstartTabs() {
  const [tab, setTab] = React.useState<'fetch' | 'axios'>('fetch');

  const fetchInstall = `npm install x402-fetch`;
  const fetchCode = `import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";

// Create a wallet client
const account = privateKeyToAccount("0xYourPrivateKey");
const client = createWalletClient({
  account,
  transport: http(),
  chain: baseSepolia,
});

// Wrap the fetch function with payment handling
const fetchWithPay = wrapFetchWithPayment(fetch, client);

// Make a request that may require payment
const response = await fetchWithPay(
  "https://x402.payai.network/api/base-sepolia/paid-content",
  {
    method: "GET",
  }
);

const data = await response.json();`;

  const fetchMainnetCode = `import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { base } from "viem/chains";

// Create a wallet client
const account = privateKeyToAccount("0xYourPrivateKey");
const client = createWalletClient({
  account,
  transport: http(),
  chain: base,
});

// Wrap the fetch function with payment handling
const fetchWithPay = wrapFetchWithPayment(fetch, client);

// Make a request that may require payment
const response = await fetchWithPay(
  "https://x402.payai.network/api/base/paid-content",
  {
    method: "GET",
  }
);

const data = await response.json();`;

  const axiosInstall = `npm install x402-axios`;
  const axiosCode = `import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";
import axios from "axios";
import { baseSepolia } from "viem/chains";

// Create a wallet client
const account = privateKeyToAccount("0xYourPrivateKey");
const client = createWalletClient({
  account,
  transport: http(),
  chain: baseSepolia,
});

// Create an Axios instance with payment handling
const api = withPaymentInterceptor(
  axios.create({
    baseURL: "https://x402.payai.network",
  }),
  client
);

// Make a request that may require payment
const response = await api.get("/api/base-sepolia/paid-content");
console.log(response.data);`;

  const axiosMainnetCode = `import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";
import axios from "axios";
import { base } from "viem/chains";

// Create a wallet client
const account = privateKeyToAccount("0xYourPrivateKey");
const client = createWalletClient({
  account,
  transport: http(),
  chain: base,
});

// Create an Axios instance with payment handling
const api = withPaymentInterceptor(
  axios.create({
    baseURL: "https://x402.payai.network",
  }),
  client
);

// Make a request that may require payment
const response = await api.get("/api/base/paid-content");
console.log(response.data);`;

  return (
    <div>
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold text-lg transition border-b-2 ${tab === 'fetch' ? 'text-blue-400 border-blue-400 bg-gray-800' : 'text-gray-300 border-transparent bg-gray-900'}`}
          onClick={() => setTab('fetch')}
        >
          x402-fetch
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold text-lg transition border-b-2 ml-2 ${tab === 'axios' ? 'text-blue-400 border-blue-400 bg-gray-800' : 'text-gray-300 border-transparent bg-gray-900'}`}
          onClick={() => setTab('axios')}
        >
          x402-axios
        </button>
      </div>
      <div className="bg-gray-950 rounded-b-lg p-6 text-left">
        {tab === 'fetch' ? (
          <>
            <div className="mb-4 relative">
              <div className="mb-1 text-blue-300 font-semibold">Install</div>
              <div className="relative">
                <CopyButton code={fetchInstall} />
                <SyntaxHighlighter language="bash" style={oneDark} customStyle={{ borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.95em' }}>
                  {fetchInstall}
                </SyntaxHighlighter>
              </div>
            </div>
            <div className="relative mb-4">
              <div className="mb-1 text-blue-300 font-semibold">Base Sepolia</div>
              <CopyButton code={fetchCode} />
              <SyntaxHighlighter language="javascript" style={oneDark} customStyle={{ borderRadius: '0.5rem', fontSize: '0.95em' }}>
                {fetchCode}
              </SyntaxHighlighter>
            </div>
            <div className="relative">
              <div className="mb-1 text-blue-300 font-semibold">Base Mainnet</div>
              <CopyButton code={fetchMainnetCode} />
              <SyntaxHighlighter language="javascript" style={oneDark} customStyle={{ borderRadius: '0.5rem', fontSize: '0.95em' }}>
                {fetchMainnetCode}
              </SyntaxHighlighter>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 relative">
              <div className="mb-1 text-blue-300 font-semibold">Install</div>
              <div className="relative">
                <CopyButton code={axiosInstall} />
                <SyntaxHighlighter language="bash" style={oneDark} customStyle={{ borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.95em' }}>
                  {axiosInstall}
                </SyntaxHighlighter>
              </div>
            </div>
            <div className="relative mb-4">
              <div className="mb-1 text-blue-300 font-semibold">Base Sepolia</div>
              <CopyButton code={axiosCode} />
              <SyntaxHighlighter language="javascript" style={oneDark} customStyle={{ borderRadius: '0.5rem', fontSize: '0.95em' }}>
                {axiosCode}
              </SyntaxHighlighter>
            </div>
            <div className="relative">
              <div className="mb-1 text-blue-300 font-semibold">Base Mainnet</div>
              <CopyButton code={axiosMainnetCode} />
              <SyntaxHighlighter language="javascript" style={oneDark} customStyle={{ borderRadius: '0.5rem', fontSize: '0.95em' }}>
                {axiosMainnetCode}
              </SyntaxHighlighter>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
