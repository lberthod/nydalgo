import { BaseProvider } from './base.js';

/**
 * Provider CoinGecko - API publique gratuite (backup si Binance indisponible)
 * Documentation: https://www.coingecko.com/en/api/documentation
 * Note: CoinGecko ne fournit pas de timeframes précis comme 6h, donc approximation
 */
export class CoinGeckoProvider extends BaseProvider {
  constructor() {
    super();
    this.baseUrl = 'https://api.coingecko.com/api/v3';
  }

  getName() {
    return 'coingecko';
  }

  /**
   * Convertit interval en jours approximatifs pour CoinGecko
   */
  convertIntervalToDays(interval, limit) {
    const intervalToDays = {
      '1m': limit / 1440,
      '5m': limit / 288,
      '15m': limit / 96,
      '30m': limit / 48,
      '1h': limit / 24,
      '4h': limit / 6,
      '6h': limit / 4,
      '1d': limit,
    };
    return Math.ceil(intervalToDays[interval] || limit);
  }

  /**
   * Récupère les données de marché depuis CoinGecko
   */
  async fetchCandles(symbol, interval, limit) {
    const days = this.convertIntervalToDays(interval, limit);
    const coinId = 'bitcoin';
    const vsCurrency = 'usd';
    const url = `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return this.normalizeCandles(data, interval, limit);
    } catch (error) {
      throw new Error(`Failed to fetch from CoinGecko: ${error.message}`);
    }
  }

  /**
   * Normalise les données CoinGecko (qui ne fournit que prix et volumes)
   * On simule OHLC en utilisant les prix disponibles
   */
  normalizeCandles(rawData, interval, limit) {
    const prices = rawData.prices || [];
    const volumes = rawData.total_volumes || [];
    
    const intervalMs = this.getIntervalMs(interval);
    const candles = [];
    
    for (let i = 0; i < prices.length; i++) {
      const [timestamp, price] = prices[i];
      const volume = volumes[i] ? volumes[i][1] : 0;
      
      candles.push({
        timestamp,
        open: price,
        high: price,
        low: price,
        close: price,
        volume
      });
    }
    
    return candles.slice(-limit);
  }

  getIntervalMs(interval) {
    const mapping = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    };
    return mapping[interval] || 60 * 60 * 1000;
  }
}
