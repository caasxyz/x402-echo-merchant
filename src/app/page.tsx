'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, Rocket, BookOpen } from 'lucide-react';
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
      {/* Hero Section */}
      <Card className="max-w-2xl w-full text-center py-16 mb-10 bg-gradient-to-b from-gray-950 to-gray-900 border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-5xl font-extrabold mb-4 text-white tracking-tight">x402 Echo Server</CardTitle>
          <CardDescription className="mb-8 text-2xl text-gray-200 font-light">
            Instantly test the <span className="text-blue-400 font-semibold">x402 protocol</span> for pay-per-use APIs.<br />
            Live endpoints. Real payments. <span className="text-green-400">100% refunds.</span>
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button asChild size="lg" className="gap-2">
              <a href="#playground">
                <Rocket className="w-5 h-5" /> Try It Now
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg" className="gap-2">
              <a href="https://x402.org/docs" target="_blank" rel="noopener noreferrer">
                <BookOpen className="w-5 h-5" /> View Docs
              </a>
            </Button>
          </div>
          <div className="text-gray-400 text-base">
            <span>
              Open source • Powered by{' '}
              <a
                href="https://x402.org"
                className="underline text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                x402
              </a>
            </span>
          </div>
        </CardHeader>
      </Card>
      {/* Endpoint Reference Table */}
      <Card className="w-full max-w-3xl bg-gray-900 rounded-xl shadow-lg p-8 mt-0 mb-16 border-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white mb-6 text-center">Endpoint Reference</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="text-gray-400 text-sm">
              <TableHead className="py-2 px-3">Endpoint</TableHead>
              <TableHead className="py-2 px-3">Method</TableHead>
              <TableHead className="py-2 px-3">Description</TableHead>
              <TableHead className="py-2 px-3">Examples</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-gray-200 text-base">
            <TableRow className="border-t border-gray-800">
              <TableCell className="py-2 px-3 font-mono">/api/base-sepolia/paid-content</TableCell>
              <TableCell className="py-2 px-3">GET</TableCell>
              <TableCell className="py-2 px-3">Echo endpoint (Base Sepolia testnet)</TableCell>
              <TableCell className="py-2 px-3">
                <Button variant="link" size="sm" className="text-blue-400 px-0" onClick={() => toggle('base-sepolia')}>
                  {open['base-sepolia'] ? 'Hide' : 'Show'}
                </Button>
              </TableCell>
            </TableRow>
            {open['base-sepolia'] && (
              <TableRow>
                <TableCell colSpan={4} className="bg-gray-800 rounded p-4">
                  <div className="mb-2 font-semibold text-green-400">Sample 200 Response</div>
                  <pre className="bg-gray-950 text-white p-3 rounded text-sm overflow-x-auto mb-4">{`HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"message": "Hello, world!"}`}</pre>
                  <div className="mb-2 font-semibold text-yellow-400">Sample 402 Response</div>
                  <pre className="bg-gray-950 text-white p-3 rounded text-sm overflow-x-auto">{`HTTP/1.1 402 Payment Required\nContent-Type: application/json\n\n{"error": "Payment Required"}`}</pre>
                </TableCell>
              </TableRow>
            )}
            <TableRow className="border-t border-gray-800">
              <TableCell className="py-2 px-3 font-mono">/api/mainnet/paid-content</TableCell>
              <TableCell className="py-2 px-3">GET</TableCell>
              <TableCell className="py-2 px-3">Echo endpoint (Base mainnet)</TableCell>
              <TableCell className="py-2 px-3">
                <Button variant="link" size="sm" className="text-blue-400 px-0" onClick={() => toggle('base')}>
                  {open.base ? 'Hide' : 'Show'}
                </Button>
              </TableCell>
            </TableRow>
            {open.base && (
              <TableRow>
                <TableCell colSpan={4} className="bg-gray-800 rounded p-4">
                  <div className="mb-2 font-semibold text-green-400">Sample 200 Response</div>
                  <pre className="bg-gray-950 text-white p-3 rounded text-sm overflow-x-auto mb-4">{`HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"message": "Hello, world!"}`}</pre>
                  <div className="mb-2 font-semibold text-yellow-400">Sample 402 Response</div>
                  <pre className="bg-gray-950 text-white p-3 rounded text-sm overflow-x-auto">{`HTTP/1.1 402 Payment Required\nContent-Type: application/json\n\n{"error": "Payment Required"}`}</pre>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      {/* Quickstart Code Snippets */}
      <Card className="w-full max-w-3xl bg-gray-900 rounded-xl shadow-lg p-8 mb-16 border-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white mb-6 text-center">Quickstart Code Snippets</CardTitle>
        </CardHeader>
        <QuickstartTabs />
      </Card>
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
    <Button
      onClick={handleCopy}
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2 flex items-center gap-1 text-gray-200"
      aria-label="Copy code"
      type="button"
    >
      <Copy className="w-4 h-4" />
      {copied ? 'Copied!' : 'Copy'}
    </Button>
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
    <Tabs value={tab} onValueChange={(value) => setTab(value as 'fetch' | 'axios')} className="w-full">
      <TabsList className="flex justify-center mb-4">
        <TabsTrigger value="fetch" className="px-4 py-2 rounded-t-lg font-semibold text-lg transition border-b-2">
          x402-fetch
        </TabsTrigger>
        <TabsTrigger value="axios" className="px-4 py-2 rounded-t-lg font-semibold text-lg transition border-b-2 ml-2">
          x402-axios
        </TabsTrigger>
      </TabsList>
      <TabsContent value="fetch">
        <div className="bg-gray-950 rounded-b-lg p-6 text-left">
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
        </div>
      </TabsContent>
      <TabsContent value="axios">
        <div className="bg-gray-950 rounded-b-lg p-6 text-left">
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
        </div>
      </TabsContent>
    </Tabs>
  );
}
