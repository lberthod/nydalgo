/**
 * Calcule l'EMA (Exponential Moving Average) sur une série de prix
 * 
 * Formule: EMA[t] = close[t] * k + EMA[t-1] * (1-k)
 * où k = 2 / (period + 1)
 * 
 * Initialisation: SMA sur les N premières valeurs
 */

/**
 * Calcule la SMA (Simple Moving Average) pour l'initialisation
 */
function calculateSMA(values, period) {
  if (values.length < period) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  const slice = values.slice(0, period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

/**
 * Calcule l'EMA pour un tableau de prix (closes)
 * @param {Array<number>} closes - Tableau des prix de clôture
 * @param {number} period - Période de l'EMA (ex: 20, 50, 200)
 * @returns {Array<number|null>} Tableau des valeurs EMA (null pour les valeurs insuffisantes)
 */
export function calculateEMA(closes, period) {
  if (!closes || closes.length === 0) {
    return [];
  }

  if (period <= 0 || period > closes.length) {
    throw new Error(`Invalid EMA period: ${period}. Must be between 1 and ${closes.length}`);
  }

  const ema = [];
  const k = 2 / (period + 1);

  // Les premières valeurs avant d'avoir assez de données sont null
  for (let i = 0; i < period - 1; i++) {
    ema.push(null);
  }

  // Initialisation avec SMA sur les 'period' premières valeurs
  const sma = calculateSMA(closes, period);
  ema.push(sma);

  // Calcul itératif de l'EMA
  for (let i = period; i < closes.length; i++) {
    const currentEMA = closes[i] * k + ema[i - 1] * (1 - k);
    ema.push(currentEMA);
  }

  return ema;
}

/**
 * Calcule plusieurs EMAs en une seule passe
 * @param {Array<number>} closes - Tableau des prix de clôture
 * @param {Array<number>} periods - Tableau des périodes (ex: [20, 50, 200])
 * @returns {Object} Objet avec les EMAs par période {20: [...], 50: [...], 200: [...]}
 */
export function calculateMultipleEMAs(closes, periods) {
  const result = {};
  
  for (const period of periods) {
    result[period] = calculateEMA(closes, period);
  }
  
  return result;
}

/**
 * Calcule l'EMA et retourne le dernier point avec métadonnées
 */
export function getLatestEMA(closes, period) {
  const ema = calculateEMA(closes, period);
  const lastEMA = ema[ema.length - 1];
  const lastClose = closes[closes.length - 1];
  
  return {
    value: lastEMA,
    close: lastClose,
    above: lastClose > lastEMA,
    difference: lastClose - lastEMA,
    differencePercent: ((lastClose - lastEMA) / lastEMA) * 100
  };
}
