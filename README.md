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
