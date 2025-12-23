/**
 * Analyse les signaux de trading basés sur les EMAs
 */

/**
 * Détecte le croisement (crossover) entre deux EMAs
 * @returns 'golden' (EMA rapide croise au dessus), 'death' (croise en dessous), 'none'
 */
export function detectCrossover(emaFast, emaSlow) {
  if (!emaFast || !emaSlow || emaFast.length < 2 || emaSlow.length < 2) {
    return 'none';
  }

  const fastCurrent = emaFast[emaFast.length - 1];
  const fastPrevious = emaFast[emaFast.length - 2];
  const slowCurrent = emaSlow[emaSlow.length - 1];
  const slowPrevious = emaSlow[emaSlow.length - 2];

  // Golden cross: EMA rapide passe au-dessus de l'EMA lente
  if (fastPrevious <= slowPrevious && fastCurrent > slowCurrent) {
    return 'golden';
  }

  // Death cross: EMA rapide passe en-dessous de l'EMA lente
  if (fastPrevious >= slowPrevious && fastCurrent < slowCurrent) {
    return 'death';
  }

  return 'none';
}

/**
 * Détermine la tendance générale
 */
export function detectTrend(emaFast, emaSlow) {
  if (!emaFast || !emaSlow || emaFast.length === 0 || emaSlow.length === 0) {
    return 'neutral';
  }

  const fastValue = emaFast[emaFast.length - 1];
  const slowValue = emaSlow[emaSlow.length - 1];

  if (fastValue === null || slowValue === null) {
    return 'neutral';
  }

  if (fastValue > slowValue) {
    return 'bullish';
  } else if (fastValue < slowValue) {
    return 'bearish';
  }

  return 'neutral';
}

/**
 * Génère un rapport complet de signaux
 */
export function generateSignals(closes, emaFast, emaSlow, emaFastPeriod, emaSlowPeriod) {
  const currentPrice = closes[closes.length - 1];
  const fastValue = emaFast[emaFast.length - 1];
  const slowValue = emaSlow[emaSlow.length - 1];

  const cross = detectCrossover(emaFast, emaSlow);
  const trend = detectTrend(emaFast, emaSlow);

  return {
    trend,
    cross,
    priceAboveFastEma: currentPrice > fastValue,
    priceAboveSlowEma: currentPrice > slowValue,
    currentPrice,
    emaFast: {
      period: emaFastPeriod,
      value: fastValue,
      distance: currentPrice - fastValue,
      distancePercent: ((currentPrice - fastValue) / fastValue) * 100
    },
    emaSlow: {
      period: emaSlowPeriod,
      value: slowValue,
      distance: currentPrice - slowValue,
      distancePercent: ((currentPrice - slowValue) / slowValue) * 100
    },
    spread: {
      value: fastValue - slowValue,
      percent: ((fastValue - slowValue) / slowValue) * 100
    }
  };
}
