/**
 * Interface de base pour les providers de données crypto
 * Tous les providers doivent implémenter cette interface
 */
export class BaseProvider {
  /**
   * @param {string} symbol - Symbole de la paire (ex: BTCUSDT)
   * @param {string} interval - Intervalle des bougies (ex: 1m, 5m, 1h, 6h, 1d)
   * @param {number} limit - Nombre de bougies à récupérer
   * @returns {Promise<Array>} Tableau de bougies normalisées
   */
  async fetchCandles(symbol, interval, limit) {
    throw new Error('fetchCandles must be implemented');
  }

  /**
   * Normalise les données brutes du provider en format standard
   * @returns {Array} [{timestamp, open, high, low, close, volume}]
   */
  normalizeCandles(rawData) {
    throw new Error('normalizeCandles must be implemented');
  }

  /**
   * Retourne le nom du provider
   */
  getName() {
    throw new Error('getName must be implemented');
  }

  /**
   * Convertit les intervalles standards vers le format du provider
   */
  convertInterval(interval) {
    return interval;
  }
}
