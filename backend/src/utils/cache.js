/**
 * Système de cache en mémoire avec TTL (Time To Live)
 * Cache par clé composée de (provider, symbol, interval, limit)
 */

export class MemoryCache {
  constructor(ttlSeconds = 30) {
    this.cache = new Map();
    this.ttlMs = ttlSeconds * 1000;
  }

  /**
   * Génère une clé unique pour le cache
   */
  generateKey(provider, symbol, interval, limit, extra = '') {
    return `${provider}:${symbol}:${interval}:${limit}${extra ? ':' + extra : ''}`;
  }

  /**
   * Récupère une valeur du cache si elle existe et n'est pas expirée
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Vérifie si une clé existe et est valide
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Invalide une clé spécifique
   */
  invalidate(key) {
    this.cache.delete(key);
  }

  /**
   * Vide tout le cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retourne des statistiques sur le cache
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > this.ttlMs) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      ttlSeconds: this.ttlMs / 1000
    };
  }
}
