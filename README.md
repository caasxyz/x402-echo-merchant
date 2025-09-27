# x402 Echo Merchant Server

A modern, developer-focused pay-per-use API demo server for the [x402 protocol](https://x402.org). Instantly test x402 payments, see live paywall enforcement, and get a rizzler GIF reward after payment—plus a full refund!

---

## Demo

[https://x402.payai.network/](https://x402.payai.network)

---

## Features

- **Pay-per-use API endpoints** on Base Mainnet and Base Sepolia
- **x402 paywall middleware**: Enforces payment before serving protected content
- **Rizzler GIF reward**: After payment, receive a fun GIF and full transaction/refund details
- **100% refunds**: All payments are instantly refunded for demo/testing
- **Modern UI**: Built with Next.js, TailwindCSS, and shadcn/ui
- **Edge-compatible**: Middleware works on Vercel/Edge, with Node.js logic offloaded to API routes

---

## How It Works

1. **Request a paid endpoint** (e.g. `/api/base/paid-content`)
2. **x402 middleware** checks for payment and enforces the paywall
3. **After payment**:
   - Middleware verifies and settles the payment
   - Instantly refunds the payment
   - Returns a custom HTML page with:
     - "Thank you for your payment! Have some rizz!"
     - The rizzler
     - Payment and refund transaction links
     - The full payment response as a code snippet

---

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in required values (see below)

3. **Run the dev server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   - The app will be available at [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

- `NEXT_PUBLIC_SITE_URL` - Base URL of the server (used by the web app)
- `FACILITATOR_URL` - URL of the x402 facilitator service (e.g. `https://facilitator.payai.network`)

- `EVM_RECEIVE_PAYMENTS_ADDRESS` - EVM address to receive payments to
- `SVM_RECEIVE_PAYMENTS_ADDRESS` - Solana address to receive payments to
- `EVM_PRIVATE_KEY` - EVM private key used to send refunds (hex string starting with `0x`)
- `SVM_PRIVATE_KEY` - Solana private key used to send refunds

- `BASE_RPC_URL` - Base Mainnet RPC URL (https)
- `BASE_SEPOLIA_RPC_URL` - Base Sepolia RPC URL (https)
- `AVALANCHE_RPC_URL` - Avalanche Mainnet RPC URL (https)
- `AVALANCHE_FUJI_RPC_URL` - Avalanche Fuji Testnet RPC URL (https)
- `SEI_RPC_URL` - Sei Mainnet RPC URL (https)
- `SEI_TESTNET_RPC_URL` - Sei Testnet RPC URL (https)
- `SOLANA_RPC_URL` - Solana Mainnet RPC URL (https)
- `SOLANA_DEVNET_RPC_URL` - Solana Devnet RPC URL (https)
- `SOLANA_WS_URL` - (optional) Solana Mainnet WebSocket URL (wss)
- `SOLANA_DEVNET_WS_URL` - (optional) Solana Devnet WebSocket URL (wss)
- `IOTEX_RPC_URL` - (optional) IoTeX Mainnet RPC URL (https)

---

## Deployment

- Deploy to Vercel, your own Node.js server, or any platform supporting Next.js
- For Edge compatibility, all Node.js-only logic is handled in API routes, including:
---- authenticating with @coinbase/cdp-sdk which relies on the NodeJS crypto library

---

## License

Apache V2
