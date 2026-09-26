*If this research helped you, please consider giving it a ⭐ Star.*

## 🚀 Stay Updated
Found this research useful?
* **Star ⭐** this repo to keep track of it.
* **Follow me** on GitHub for more DeFi security research.
* **Fork** it if you want to run your own experiments.

### ☕ Support the Research
If you appreciate the work and want to support further security research:

<img src="456.PNG" alt="Donate QR" width="200"/>

**Wallet Address (ETH/EVM):**0xBDDD7973D0DE27B715A4A5cbdb87d0DF78757b3A 

<img src="465.PNG" alt="Donate QR" width="200"/>
**Solana:**8RpjaJQmCrRvKHMXA5ak4CrrLNJnJionwxMfTRG8YAS


#  Base Arbitrage Detector

A lightweight, real-time arbitrage opportunity detector between **Uniswap V3** and **Aerodrome** on the Base L2 network. Built with TypeScript and Viem for minimal resource consumption.

![Arbitrage Opportunity](https://github.com/rdin777/base_bot/blob/main/756.PNG)

## ✨ Features

-  **Real-time monitoring** via WebSocket subscriptions (sub-second latency)
- 💰 **Smart profit calculation** — accounts for pool fees, gas costs, and slippage
- 🎯 **Low resource footprint** — runs on servers with just 1GB RAM
- 🔔 **Intelligent alerts** — only notifies when net profit exceeds threshold
- 🛡️ **Type-safe** — built with TypeScript and Viem
- 📊 **Multi-pool support** — monitors Uniswap V3 (concentrated liquidity) and Aerodrome (Basic Pools)

## 📊 Live Results

During testing, the detector found real arbitrage opportunities:

| Metric | Value |
|--------|-------|
| **Pair** | WETH/USDC |
| **Route** | Uniswap → Aerodrome |
| **Spread** | 0.574% |
| **Investment** | $1,000 |
| **Fees** | ~$3.60 |
| **Net Profit** | **$1.62** ✅ |

## 🏗️ Architecture


## 🚀 Installation

### Prerequisites

- Node.js v18+ 
- npm or yarn
- WebSocket RPC URL (Alchemy, QuickNode, or BlastAPI)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rdin777/base_bot.git
   cd base_bot
Install dependencies
      npm install
Configure environment:   
      cp .env.example .env
Edit .env and add your WebSocket RPC URL:
BASE_WS_RPC_URL=wss://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
Run the detector
npx tsx bot.ts
⚙️ Configuration
Edit constants in bot.ts to customize behavior:
const TRADE_SIZE_USD = 1000;      // Test trade size
const GAS_COST_USD = 0.10;        // Estimated gas cost on Base
const SLIPPAGE = 0.0005;          // 0.05% slippage buffer
const FEE_UNI = 0.0005;           // Uniswap V3 fee (0.05%)
const FEE_AERO = 0.003;           // Aerodrome fee (0.3%)
const MIN_PROFIT_USD = 0.50;      // Minimum profit to trigger alert
🧮 How Profit is Calculated
The detector simulates a complete arbitrage trade:
Buy tokens on the cheaper DEX (after fee deduction)
Sell tokens on the more expensive DEX (after fee deduction)
Subtract gas costs and slippage buffer
Alert only if net_profit >= MIN_PROFIT_USD
Formula:
net_profit = (trade_size × (1 - fee₁) / price₁ × price₂ × (1 - fee₂) × (1 - slippage)) - trade_size - gas

⚠️ Risks & Warnings
This is an experimental tool for educational purposes.
MEV Risk: Public transactions can be sandwiched by MEV bots. Use private RPCs (Flashbots Protect) for real trades.
📉 Slippage: Large trades move the price. The detector assumes small trade sizes.
⛽ Gas Spikes: Base gas is usually cheap (~$0.05-0.10), but can spike during congestion.
🔄 Execution Risk: Prices change between detection and execution. This detector does NOT execute trades automatically.
🧠 Not Financial Advice: Always DYOR. Test with small amounts first.

🛣️ Roadmap
Add eth_call transaction simulation before execution
Support more trading pairs (BRETT/WETH, DEGEN/USDC, cbBTC/WETH)
Implement smart contract for atomic arbitrage with flash loans
Add MEV protection via private transaction submission
Web dashboard for real-time visualization
Telegram/Discord alerts integration

🛠️ Tech Stack
TypeScript — Type-safe development
Viem — Lightweight Ethereum client library
tsx — Fast TypeScript execution
Base L2 — Low-cost, high-speed network
Uniswap V3 — Concentrated liquidity DEX
Aerodrome — ve(3,3) DEX on Base

📝 License
MIT License — feel free to use, modify, and distribute.
🤝 Contributing
PRs and issues are welcome! This is an open-source experiment in DeFi arbitrage detection.
Built with ❤️ for the Base ecosystem

   
