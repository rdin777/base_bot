import { createPublicClient, webSocket, parseAbi } from 'viem';
import { base } from 'viem/chains';
import 'dotenv/config';

// === TRADING SETTINGS ===
const TRADE_SIZE_USD = 1000; // Size of the test trade in dollars
const GAS_COST_USD = 0.10;   // Estimated gas cost on Base per arbitrage transaction
const SLIPPAGE = 0.0005;     // We factor in 0.05% for price slippage.

// Pool fees (in decimal format)
const FEE_UNI = 0.0005;  // 0.05% for Uniswap V3 WETH/USDC
const FEE_AERO = 0.003;  // 0.3% for Aerodrome Volatile WETH/USDC

// Alert threshold: shown only if net profit exceeds this amount in USD.
const MIN_PROFIT_USD = 0.50; 

// Pool addresses (VERIFIED)
const UNISWAP_POOL = '0xd0b53D9277642d899DF5C87A3966A349A798F224' as const;
const AERODROME_POOL = '0xcDAC0d6c6C59727a65F871236188350531885C43' as const;

const WETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

let lastUniswapPrice: number | null = null;
let lastAerodromePrice: number | null = null;
let lastUpdate = Date.now();

function sqrtPriceX96ToPrice(sqrtPriceX96: bigint, decimals0: number, decimals1: number): number {
  const Q96 = 2n ** 96n;
  const Q192 = Q96 * Q96;
  const numerator = sqrtPriceX96 * sqrtPriceX96;
  
  if (decimals0 >= decimals1) {
    const rawPriceScaled = (numerator * 10n ** BigInt(decimals0 - decimals1)) / Q192;
    return Number(rawPriceScaled);
  } else {
    const rawPriceScaled = numerator / (Q192 * 10n ** BigInt(decimals1 - decimals0));
    return Number(rawPriceScaled);
  }
}

async function main() {
  const wsUrl = process.env.BASE_WS_RPC_URL;
  if (!wsUrl) {
    console.error('❌ BASE_WS_RPC_URL not set in .env');
    process.exit(1);
  }

  const client = createPublicClient({
    chain: base,
    transport: webSocket(wsUrl),
  });

  console.log('🚀 Smart arbitrage detector launched');
  console.log(`💰 Deal size: $${TRADE_SIZE_USD}`);
  console.log(`⛽ Gas cost: ~$${GAS_COST_USD}`);
  console.log(`🎯 Min. profit for alert: $${MIN_PROFIT_USD}\n`);

  client.watchContractEvent({
    address: UNISWAP_POOL,
    abi: parseAbi(['event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)']),
    eventName: 'Swap',
    onLogs: (logs) => {
      for (const log of logs) {
        lastUniswapPrice = sqrtPriceX96ToPrice(log.args.sqrtPriceX96, WETH_DECIMALS, USDC_DECIMALS);
        checkSpread();
      }
    }
  });

  client.watchContractEvent({
    address: AERODROME_POOL,
    abi: parseAbi(['event Swap(address indexed sender, address indexed to, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out)']),
    eventName: 'Swap',
    onLogs: (logs) => {
      for (const log of logs) {
        const { amount0In, amount1In, amount0Out, amount1Out } = log.args;
        const wethAmount = Number(amount0In > 0n ? amount0In : amount0Out) / (10 ** WETH_DECIMALS);
        const usdcAmount = Number(amount1In > 0n ? amount1In : amount1Out) / (10 ** USDC_DECIMALS);
        
        if (wethAmount > 0) {
          lastAerodromePrice = usdcAmount / wethAmount;
          checkSpread();
        }
      }
    }
  });

  setInterval(() => {
    if (Date.now() - lastUpdate > 60000) console.warn('⚠️ No updates for more than 60 seconds.');
  }, 10000);
}

function checkSpread() {
  lastUpdate = Date.now();
  if (lastUniswapPrice === null || lastAerodromePrice === null) return;

  const minPrice = Math.min(lastUniswapPrice, lastAerodromePrice);
  if (minPrice <= 0) return;

  const spreadPercent = (Math.abs(lastUniswapPrice - lastAerodromePrice) / minPrice) * 100;

  // === PROFIT CALCULATION ===
  let netProfit = 0;
  let direction = '';

  if (lastUniswapPrice < lastAerodromePrice) {
    // Buy on Uniswap (cheaper), sell on Aerodrome (more expensive).
    direction = 'Uniswap ➔ Aerodrome';
    const afterFeeUni = TRADE_SIZE_USD * (1 - FEE_UNI);
    const tokensBought = afterFeeUni / lastUniswapPrice;
    const grossOut = tokensBought * lastAerodromePrice;
    const afterFeeAero = grossOut * (1 - FEE_AERO);
    const afterSlippage = afterFeeAero * (1 - SLIPPAGE);
    netProfit = afterSlippage - TRADE_SIZE_USD - GAS_COST_USD;
  } else {
    // Buy on Aerodrome (cheaper), sell on Uniswap (more expensive).
    direction = 'Aerodrome ➔ Uniswap';
    const afterFeeAero = TRADE_SIZE_USD * (1 - FEE_AERO);
    const tokensBought = afterFeeAero / lastAerodromePrice;
    const grossOut = tokensBought * lastUniswapPrice;
    const afterFeeUni = grossOut * (1 - FEE_UNI);
    const afterSlippage = afterFeeUni * (1 - SLIPPAGE);
    netProfit = afterSlippage - TRADE_SIZE_USD - GAS_COST_USD;
  }

  // Real-time single-line output
  const profitColor = netProfit > 0 ? '🟢' : '🔴';
  process.stdout.write(
    `\r${profitColor} Uni: $${lastUniswapPrice.toFixed(2)} | Aero: $${lastAerodromePrice.toFixed(2)} | Spread: ${spreadPercent.toFixed(3)}% | Net: $${netProfit.toFixed(2)}   `
  );

  // Alert only if the actual profit is positive and above the threshold.
  if (netProfit >= MIN_PROFIT_USD) {
    console.log(`\n\n🚨 ARBITRAGE OPPORTUNITY!`);
    console.log(`🔄 Route: ${direction}`);
    console.log(`📈 Spread: ${spreadPercent.toFixed(3)}%`);
    console.log(`💵 Investment: $${TRADE_SIZE_USD} | Commissions: ~$${(TRADE_SIZE_USD * (FEE_UNI + FEE_AERO) + GAS_COST_USD).toFixed(2)}`);
    console.log(`💰 NET PROFIT: $${netProfit.toFixed(2)} `);
    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}\n`);
  }
}

main().catch(console.error);
