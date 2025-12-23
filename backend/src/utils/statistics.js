/**
 * Calcule les statistiques sur les données Bitcoin
 */

/**
 * Calcule les statistiques pour une période donnée
 */
export function calculatePeriodStats(candles, periodName) {
  if (!candles || candles.length === 0) {
    return null;
  }

  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const volumes = candles.map(c => c.volume);

  const current = closes[closes.length - 1];
  const open = candles[0].open;
  const high = Math.max(...highs);
  const low = Math.min(...lows);
  const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
  const avgVolume = totalVolume / volumes.length;

  const change = current - open;
  const changePercent = (change / open) * 100;

  const highCandle = candles.find(c => c.high === high);
  const lowCandle = candles.find(c => c.low === low);

  return {
    period: periodName,
    current,
    open,
    high,
    low,
    change,
    changePercent,
    totalVolume,
    avgVolume,
    highTimestamp: highCandle?.timestamp,
    lowTimestamp: lowCandle?.timestamp,
    candleCount: candles.length
  };
}

/**
 * Calcule les statistiques complètes sur plusieurs périodes
 */
export function calculateMultiPeriodStats(allCandles) {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  const periods = {
    '1h': oneHour,
    '4h': 4 * oneHour,
    '24h': oneDay,
    '48h': 2 * oneDay,
    '72h': 3 * oneDay,
    '7d': 7 * oneDay,
    '14d': 14 * oneDay,
    '30d': 30 * oneDay
  };

  const stats = {};

  for (const [periodName, duration] of Object.entries(periods)) {
    const cutoffTime = now - duration;
    const periodCandles = allCandles.filter(c => c.timestamp >= cutoffTime);
    
    if (periodCandles.length > 0) {
      stats[periodName] = calculatePeriodStats(periodCandles, periodName);
    }
  }

  return stats;
}

/**
 * Calcule les niveaux de support et résistance
 */
export function calculateSupportResistance(candles, levels = 5) {
  if (!candles || candles.length === 0) {
    return { support: [], resistance: [] };
  }

  const prices = candles.flatMap(c => [c.high, c.low, c.close]);
  const sortedPrices = [...new Set(prices)].sort((a, b) => a - b);
  
  const current = candles[candles.length - 1].close;
  
  const support = sortedPrices
    .filter(p => p < current)
    .slice(-levels)
    .reverse();
  
  const resistance = sortedPrices
    .filter(p => p > current)
    .slice(0, levels);

  return { support, resistance };
}

/**
 * Calcule la volatilité (écart-type des rendements)
 */
export function calculateVolatility(candles) {
  if (!candles || candles.length < 2) {
    return 0;
  }

  const returns = [];
  for (let i = 1; i < candles.length; i++) {
    const ret = (candles[i].close - candles[i - 1].close) / candles[i - 1].close;
    returns.push(ret);
  }

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return stdDev * 100;
}

/**
 * Identifie les tendances par période
 */
export function identifyTrends(stats) {
  const trends = {};

  for (const [period, data] of Object.entries(stats)) {
    if (data.changePercent > 2) {
      trends[period] = 'strong_bullish';
    } else if (data.changePercent > 0.5) {
      trends[period] = 'bullish';
    } else if (data.changePercent < -2) {
      trends[period] = 'strong_bearish';
    } else if (data.changePercent < -0.5) {
      trends[period] = 'bearish';
    } else {
      trends[period] = 'neutral';
    }
  }

  return trends;
}

/**
 * Calcule les ATH/ATL par période
 */
export function calculatePeriodRecords(candles) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneMonth = 30 * oneDay;
  
  const periods = {
    '1m': oneMonth,
    '3m': 3 * oneMonth,
    '6m': 6 * oneMonth
  };

  const current = candles[candles.length - 1];
  const periodRecords = {};

  for (const [periodName, duration] of Object.entries(periods)) {
    const cutoffTime = now - duration;
    const periodCandles = candles.filter(c => c.timestamp >= cutoffTime);
    
    if (periodCandles.length > 0) {
      const high = Math.max(...periodCandles.map(c => c.high));
      const low = Math.min(...periodCandles.map(c => c.low));
      
      const highCandle = periodCandles.find(c => c.high === high);
      const lowCandle = periodCandles.find(c => c.low === low);

      periodRecords[periodName] = {
        period: periodName,
        high,
        low,
        highTimestamp: highCandle?.timestamp,
        lowTimestamp: lowCandle?.timestamp,
        distanceFromHigh: ((current.close - high) / high) * 100,
        distanceFromLow: ((current.close - low) / low) * 100,
        candleCount: periodCandles.length
      };
    }
  }

  return periodRecords;
}

/**
 * Génère un rapport complet de marché
 */
export function generateMarketReport(candles) {
  const stats = calculateMultiPeriodStats(candles);
  const trends = identifyTrends(stats);
  const volatility = calculateVolatility(candles);
  const { support, resistance } = calculateSupportResistance(candles);
  const periodRecords = calculatePeriodRecords(candles);

  const current = candles[candles.length - 1];
  
  const allTimeHigh = Math.max(...candles.map(c => c.high));
  const allTimeLow = Math.min(...candles.map(c => c.low));
  
  const athCandle = candles.find(c => c.high === allTimeHigh);
  const atlCandle = candles.find(c => c.low === allTimeLow);

  const distanceFromATH = ((current.close - allTimeHigh) / allTimeHigh) * 100;
  const distanceFromATL = ((current.close - allTimeLow) / allTimeLow) * 100;

  return {
    current: {
      price: current.close,
      timestamp: current.timestamp,
      open: current.open,
      high: current.high,
      low: current.low,
      volume: current.volume
    },
    stats,
    trends,
    volatility: {
      value: volatility,
      level: volatility > 3 ? 'high' : volatility > 1.5 ? 'medium' : 'low'
    },
    levels: {
      support,
      resistance
    },
    records: {
      allTimeHigh,
      allTimeLow,
      athTimestamp: athCandle?.timestamp,
      atlTimestamp: atlCandle?.timestamp,
      distanceFromATH,
      distanceFromATL
    },
    periodRecords
  };
}
