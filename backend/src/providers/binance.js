import { BaseProvider } from './base.js';

/**
 * Provider Binance - API publique REST (pas besoin de clé API)
 * Documentation: https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-data
 */
export class BinanceProvider extends BaseProvider {
  constructor() {
    super();
    this.baseUrl = 'https://api.binance.com';
  }

  getName() {
    return 'binance';
  }

  /**
   * Convertit les intervalles standards au format Binance
   */
  convertInterval(interval) {
    const mapping = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '6h': '6h',
      '1d': '1d',
    };
    return mapping[interval] || interval;
  }

  /**
   * Récupère les bougies (klines) depuis Binance
   */
  async fetchCandles(symbol, interval, limit) {
    const binanceInterval = this.convertInterval(interval);
    const url = `${this.baseUrl}/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return this.normalizeCandles(data);
    } catch (error) {
      throw new Error(`Failed to fetch from Binance: ${error.message}`);
    }
  }

  /**
   * Normalise les données Binance au format standard
   * Format Binance: [openTime, open, high, low, close, volume, closeTime, ...]
   */
  normalizeCandles(rawData) {
    return rawData.map(candle => ({
      timestamp: parseInt(candle[0]),
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));
  }
}
