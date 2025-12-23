import { BaseProvider } from './base.js';

export class AsterProvider extends BaseProvider {
  constructor() {
    super('aster');
    this.baseUrl = 'https://fapi.asterdex.com';
  }

  async fetchCandles(symbol, interval, limit = 500) {
    try {
      const url = `${this.baseUrl}/fapi/v1/klines`;
      
      const params = new URLSearchParams({
        symbol: symbol.toUpperCase(),
        interval: this.convertInterval(interval),
        limit: Math.min(limit, 1500)
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Aster API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return this.normalizeCandles(data);
    } catch (error) {
      throw new Error(`Failed to fetch from Aster: ${error.message}`);
    }
  }

  convertInterval(interval) {
    const mapping = {
      '1m': '1m',
      '3m': '3m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '2h': '2h',
      '4h': '4h',
      '6h': '6h',
      '8h': '8h',
      '12h': '12h',
      '1d': '1d',
      '3d': '3d',
      '1w': '1w',
      '1M': '1M'
    };
    
    return mapping[interval] || interval;
  }

  normalizeCandles(data) {
    return data.map(candle => ({
      timestamp: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));
  }
}
