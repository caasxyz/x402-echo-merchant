'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, ExternalLink, Github, Heart, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ENDPOINTS = [
  {
    label: 'Base Mainnet',
    url: `${API_URL}/api/base/paid-content`,
  },
  {
    label: 'Base Sepolia',
    url: `${API_URL}/api/base-sepolia/paid-content`,
  },
];

const QUICKSTART = {
  fetch: [
    {
      title: 'Install',
      code: 'npm install x402-fetch',
      lang: 'bash',
    },
    {
      title: 'Base Mainnet',
      code: `import { createWalletClient, http } from "viem";
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
  "${API_URL}/api/base/paid-content",
  {
    method: "GET",
  }
);

const data = await response.json();`,
      lang: 'typescript',
    },
    {
      title: 'Base Sepolia',
      code: `import { createWalletClient, http } from "viem";
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
  "${API_URL}/api/base-sepolia/paid-content",
  {
    method: "GET",
  }
);

const data = await response.json();`,
      lang: 'typescript',
    },
  ],
  axios: [
    {
      title: 'Install',
      code: 'npm install x402-axios',
      lang: 'bash',
    },
    {
      title: 'Base Mainnet',
      code: `import { createWalletClient, http } from "viem";
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
    baseURL: "${API_URL}",
  }),
  client
);

// Make a request that may require payment
const response = await api.get("/api/base/paid-content");
console.log(response.data);`,
      lang: 'typescript',
    },
    {
      title: 'Base Sepolia',
      code: `import { createWalletClient, http } from "viem";
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
    baseURL: "${API_URL}",
  }),
  client
);

// Make a request that may require payment
const response = await api.get("/api/base-sepolia/paid-content");
console.log(response.data);`,
      lang: 'typescript',
    },
  ],
};

const RESOURCES = [
  {
    label: 'x402',
    url: 'https://x402.org',
    icon: <ExternalLink className="w-4 h-4 text-indigo-600" />,
  },
  {
    label: 'x402 github',
    url: 'https://github.com/coinbase/x402',
    icon: <Github className="w-4 h-4 text-indigo-600" />,
  },
  {
    label: 'x402 Echo Server Github',
    url: 'https://github.com/notorious-d-e-v/x402-echo-server',
    icon: <Github className="w-4 h-4 text-indigo-600" />,
  },
];

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="relative bg-gray-100 dark:bg-card rounded-md p-4 mb-6 overflow-x-auto group">
      <pre className="text-sm leading-relaxed font-mono text-gray-800 dark:text-gray-100" style={{ fontFamily: 'Menlo, monospace' }}>
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 opacity-70 group-hover:opacity-100"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        aria-label="Copy code"
      >
        <Copy className="w-4 h-4" />
        <span className="sr-only">Copy</span>
      </Button>
      {copied && (
        <span className="absolute top-2 right-12 text-xs text-indigo-600 font-semibold">Copied!</span>
      )}
    </div>
  );
}

function useThemeToggle() {
  const [isDark, setIsDark] = React.useState(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  return [isDark, setIsDark] as const;
}

export default function Home() {
  const [isDark, setIsDark] = useThemeToggle();
  return (
    <main className="min-h-screen bg-white dark:bg-background text-gray-900 dark:text-foreground flex flex-col items-center px-4">
      {/* Theme Toggle Button */}
      <div className="w-full max-w-2xl flex justify-end pt-6">
        <Button
          variant="ghost"
          size="icon"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setIsDark((d) => !d)}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
      {/* Hero Section */}
      <section className="w-full max-w-2xl mx-auto py-16 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold mb-4 tracking-tight">x402 Echo Server</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl">
          Instantly test the <a href="https://x402.org" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium">x402 protocol</a> for pay-per-use APIs.<br />
          Perfect for agentic and micro transactions.<br /><br />
          Live endpoints. Real payments. <span className="text-green-600">100% refunds.</span>
        </p>
        <Card className="w-full bg-gray-50 border border-gray-200 shadow-none mb-4">
          <CardContent className="py-6 flex flex-col gap-4">
            <div className="text-base text-gray-700 font-medium mb-2">Test your x402 client against:</div>
            {ENDPOINTS.map((ep) => (
              <div key={ep.label} className="flex items-center justify-between bg-white rounded-md px-4 py-3 border border-gray-100 mb-2">
                <span className="font-mono text-sm text-gray-900">{ep.label}</span>
                <a
                  href={ep.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                >
                  {ep.url} <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      {/* Quickstart Section */}
      <section className="w-full max-w-2xl mx-auto py-16">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center">Quickstart Code Snippets</h2>
        <Tabs defaultValue="fetch" className="w-full">
          <TabsList className="flex gap-2 mb-6 bg-gray-100">
            <TabsTrigger value="fetch" className="flex-1">fetch</TabsTrigger>
            <TabsTrigger value="axios" className="flex-1">axios</TabsTrigger>
          </TabsList>
          <TabsContent value="fetch">
            {QUICKSTART.fetch.map((snippet) => (
              <div key={snippet.title} className="mb-8">
                <div className="text-sm font-semibold text-gray-700 mb-2">{snippet.title}</div>
                <CodeBlock code={snippet.code} lang={snippet.lang} />
              </div>
            ))}
          </TabsContent>
          <TabsContent value="axios">
            {QUICKSTART.axios.map((snippet) => (
              <div key={snippet.title} className="mb-8">
                <div className="text-sm font-semibold text-gray-700 mb-2">{snippet.title}</div>
                <CodeBlock code={snippet.code} lang={snippet.lang} />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </section>
      {/* Resources Section */}
      <section className="w-full max-w-2xl mx-auto py-16">
        <h3 className="text-xl font-semibold mb-6 text-center">Resources</h3>
        <ul className="flex flex-col gap-4 items-center">
          {RESOURCES.map((res) => (
            <li key={res.url} className="flex items-center gap-2">
              {res.icon}
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline hover:text-indigo-800 text-base font-medium"
              >
                {res.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
      {/* Footer */}
      <footer className="w-full py-8 flex justify-center items-center border-t border-gray-100 mt-8">
        <span className="text-gray-500 text-sm flex items-center gap-1">
          Made with <Heart className="inline w-4 h-4 text-pink-500 mx-1" fill="#ec4899" /> by{' '}
          <a
            href="https://payai.network"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline hover:text-indigo-800 font-medium"
          >
            PayAI
          </a>
        </span>
      </footer>
    </main>
  );
}
