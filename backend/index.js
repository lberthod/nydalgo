import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ProviderFactory } from './src/providers/index.js';
import { calculateEMA, calculateMultipleEMAs } from './src/utils/ema.js';
import { MemoryCache } from './src/utils/cache.js';
import { generateSignals } from './src/utils/signals.js';
import { generateMarketReport } from './src/utils/statistics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS) || 30;

const cache = new MemoryCache(CACHE_TTL);

// Configuration CORS pour production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * GET /health - Healthcheck endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
    uptime: process.uptime(),
    cache: cache.getStats()
  });
});

/**
 * GET /api/providers - Liste les providers disponibles
 */
app.get('/api/providers', (req, res) => {
  const providers = ProviderFactory.listProviders();
  res.json({
    providers,
    default: 'binance'
  });
});

/**
 * GET /api/btc/candles - Récupère les bougies normalisées
 * Query params:
 *   - interval: 1m, 5m, 15m, 1h, 4h, 6h, 1d (default: 1h)
 *   - limit: nombre de bougies (default: 500)
 *   - provider: binance, coingecko (default: binance)
 */
app.get('/api/btc/candles', async (req, res) => {
  try {
    const interval = req.query.interval || '1h';
    const limit = parseInt(req.query.limit) || 500;
    const providerName = req.query.provider || 'binance';
    const symbol = 'BTCUSDT';

    const cacheKey = cache.generateKey(providerName, symbol, interval, limit);
    
    let result = cache.get(cacheKey);
    
    if (!result) {
      const provider = ProviderFactory.getProvider(providerName);
      const candles = await provider.fetchCandles(symbol, interval, limit);
      
      result = {
        candles,
        meta: {
          provider: providerName,
          symbol,
          interval,
          limit: candles.length,
          lastUpdate: Date.now(),
          latestPrice: candles.length > 0 ? candles[candles.length - 1].close : null
        }
      };
      
      cache.set(cacheKey, result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching candles:', error);
    res.status(500).json({
      error: 'Failed to fetch candles',
      message: error.message
    });
  }
});

/**
 * GET /api/btc/ema - Récupère les bougies + EMA
 * Query params:
 *   - interval: timeframe (default: 1h)
 *   - period: période EMA (default: 20)
 *   - limit: nombre de bougies (default: 500)
 *   - provider: source de données (default: binance)
 */
app.get('/api/btc/ema', async (req, res) => {
  try {
    const interval = req.query.interval || '1h';
    const period = parseInt(req.query.period) || 20;
    const limit = parseInt(req.query.limit) || 500;
    const providerName = req.query.provider || 'binance';
    const symbol = 'BTCUSDT';

    const cacheKey = cache.generateKey(providerName, symbol, interval, limit, `ema${period}`);
    
    let result = cache.get(cacheKey);
    
    if (!result) {
      const provider = ProviderFactory.getProvider(providerName);
      const candles = await provider.fetchCandles(symbol, interval, limit);
      
      const closes = candles.map(c => c.close);
      const ema = calculateEMA(closes, period);
      
      const candlesWithEma = candles.map((candle, idx) => ({
        ...candle,
        ema: ema[idx]
      }));

      const latestCandle = candles[candles.length - 1];
      const latestEma = ema[ema.length - 1];
      
      result = {
        candles: candlesWithEma,
        ema,
        meta: {
          provider: providerName,
          symbol,
          interval,
          period,
          limit: candles.length,
          lastUpdate: Date.now(),
          latestPrice: latestCandle.close,
          latestEma,
          priceAboveEma: latestCandle.close > latestEma
        }
      };
      
      cache.set(cacheKey, result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error calculating EMA:', error);
    res.status(500).json({
      error: 'Failed to calculate EMA',
      message: error.message
    });
  }
});

/**
 * GET /api/btc/snapshot - Récupère plusieurs EMAs en une fois
 * Query params:
 *   - interval: timeframe (default: 1h)
 *   - periods: périodes EMA séparées par virgule (default: 20,50,200)
 *   - limit: nombre de bougies (default: 500)
 *   - provider: source de données (default: binance)
 */
app.get('/api/btc/snapshot', async (req, res) => {
  try {
    const interval = req.query.interval || '1h';
    const periodsStr = req.query.periods || '20,50,200';
    const periods = periodsStr.split(',').map(p => parseInt(p.trim()));
    const requestedLimit = parseInt(req.query.limit) || 500;
    const limit = Math.min(requestedLimit, 1000);
    const providerName = req.query.provider || 'binance';
    const symbol = 'BTCUSDT';

    const cacheKey = cache.generateKey(providerName, symbol, interval, limit, `snapshot${periodsStr}`);
    
    let result = cache.get(cacheKey);
    
    if (!result) {
      const provider = ProviderFactory.getProvider(providerName);
      const candles = await provider.fetchCandles(symbol, interval, limit);
      
      const closes = candles.map(c => c.close);
      const emas = calculateMultipleEMAs(closes, periods);
      
      const latestCandle = candles[candles.length - 1];
      const latestEmas = {};
      
      for (const period of periods) {
        const emaValues = emas[period];
        latestEmas[period] = emaValues[emaValues.length - 1];
      }
      
      result = {
        candles,
        emas,
        meta: {
          provider: providerName,
          symbol,
          interval,
          periods,
          limit: candles.length,
          lastUpdate: Date.now(),
          latestPrice: latestCandle.close,
          latestEmas
        }
      };
      
      cache.set(cacheKey, result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error creating snapshot:', error);
    res.status(500).json({
      error: 'Failed to create snapshot',
      message: error.message
    });
  }
});

/**
 * GET /api/btc/signals - Analyse des signaux de trading
 * Query params:
 *   - interval: timeframe (default: 6h)
 *   - emaFast: période EMA rapide (default: 20)
 *   - emaSlow: période EMA lente (default: 200)
 *   - limit: nombre de bougies (default: 500)
 *   - provider: source de données (default: binance)
 */
app.get('/api/btc/signals', async (req, res) => {
  try {
    const interval = req.query.interval || '6h';
    const emaFastPeriod = parseInt(req.query.emaFast) || 20;
    const emaSlowPeriod = parseInt(req.query.emaSlow) || 200;
    const limit = parseInt(req.query.limit) || 500;
    const providerName = req.query.provider || 'binance';
    const symbol = 'BTCUSDT';

    const cacheKey = cache.generateKey(
      providerName, 
      symbol, 
      interval, 
      limit, 
      `signals${emaFastPeriod}-${emaSlowPeriod}`
    );
    
    let result = cache.get(cacheKey);
    
    if (!result) {
      const provider = ProviderFactory.getProvider(providerName);
      const candles = await provider.fetchCandles(symbol, interval, limit);
      
      const closes = candles.map(c => c.close);
      const emaFast = calculateEMA(closes, emaFastPeriod);
      const emaSlow = calculateEMA(closes, emaSlowPeriod);
      
      const signals = generateSignals(closes, emaFast, emaSlow, emaFastPeriod, emaSlowPeriod);
      
      result = {
        signals,
        meta: {
          provider: providerName,
          symbol,
          interval,
          emaFast: emaFastPeriod,
          emaSlow: emaSlowPeriod,
          limit: candles.length,
          lastUpdate: Date.now()
        }
      };
      
      cache.set(cacheKey, result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error analyzing signals:', error);
    res.status(500).json({
      error: 'Failed to analyze signals',
      message: error.message
    });
  }
});

/**
 * GET /api/btc/stats - Rapport complet avec statistiques multi-périodes
 * Query params:
 *   - interval: timeframe (default: 1h)
 *   - limit: nombre de bougies (default: 1000)
 *   - provider: source de données (default: binance)
 */
app.get('/api/btc/stats', async (req, res) => {
  try {
    const interval = req.query.interval || '1h';
    const requestedLimit = parseInt(req.query.limit) || 1000;
    const limit = Math.min(requestedLimit, 1000);
    const providerName = req.query.provider || 'binance';
    const symbol = 'BTCUSDT';

    const cacheKey = cache.generateKey(providerName, symbol, interval, limit, 'stats');
    
    let result = cache.get(cacheKey);
    
    if (!result) {
      const provider = ProviderFactory.getProvider(providerName);
      const candles = await provider.fetchCandles(symbol, interval, limit);
      
      const report = generateMarketReport(candles);
      
      result = {
        ...report,
        meta: {
          provider: providerName,
          symbol,
          interval,
          limit: candles.length,
          lastUpdate: Date.now()
        }
      };
      
      cache.set(cacheKey, result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating stats:', error);
    res.status(500).json({
      error: 'Failed to generate statistics',
      message: error.message
    });
  }
});

setInterval(() => {
  cache.cleanup();
}, 60000);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    availableRoutes: [
      'GET /health',
      'GET /api/providers',
      'GET /api/btc/candles',
      'GET /api/btc/ema',
      'GET /api/btc/snapshot',
      'GET /api/btc/signals',
      'GET /api/btc/stats'
    ]
  });
});

const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  const serverUrl = HOST === '0.0.0.0' ? 'http://0.0.0.0' : `http://${HOST}`;
  console.log(`\n🚀 BTC EMA Backend API running`);
  console.log(`📡 Host: ${HOST}:${PORT}`);
  console.log(`📊 Cache TTL: ${CACHE_TTL} seconds`);
  console.log(`🌐 CORS: ${corsOptions.origin}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  - GET ${serverUrl}:${PORT}/health`);
  console.log(`  - GET ${serverUrl}:${PORT}/api/providers`);
  console.log(`  - GET ${serverUrl}:${PORT}/api/btc/candles`);
  console.log(`  - GET ${serverUrl}:${PORT}/api/btc/ema`);
  console.log(`  - GET ${serverUrl}:${PORT}/api/btc/snapshot`);
  console.log(`  - GET ${serverUrl}:${PORT}/api/btc/signals`);
  console.log(`  - GET ${serverUrl}:${PORT}/api/btc/stats\n`);
});
