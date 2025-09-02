import { PAYWALL_TEMPLATE } from "./gen/template";

type PaywallOptions = {
  amount: number;
  paymentRequirements: unknown[];
  currentUrl: string;
  testnet: boolean;
  cdpClientKey?: string;
  appName?: string;
  appLogo?: string;
  sessionTokenEndpoint?: string;
  config?: Record<string, unknown>;
};

function escapeString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

export function getLocalPaywallHtml({
  amount,
  testnet,
  paymentRequirements,
  currentUrl,
  cdpClientKey,
  appName,
  appLogo,
  sessionTokenEndpoint,
  config = {},
}: PaywallOptions): string {
  const configScript = `
  <script>
    window.x402 = {
      amount: ${Number.isFinite(amount) ? amount : 0},
      testnet: ${!!testnet},
      paymentRequirements: ${JSON.stringify(paymentRequirements)},
      currentUrl: "${escapeString(currentUrl)}",
      config: {
        chainConfig: ${JSON.stringify(config)},
      },
      cdpClientKey: "${escapeString(cdpClientKey || "")}",
      appName: "${escapeString(appName || "")}",
      appLogo: "${escapeString(appLogo || "")}",
      sessionTokenEndpoint: "${escapeString(sessionTokenEndpoint || "")}",
    };
  </script>`;

  return PAYWALL_TEMPLATE.replace("</head>", `${configScript}\n</head>`);
}


