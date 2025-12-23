import { BinanceProvider } from './binance.js';
import { CoinGeckoProvider } from './coingecko.js';
import { AsterProvider } from './aster.js';

/**
 * Factory pour obtenir le provider approprié
 */
export class ProviderFactory {
  static providers = {
    binance: new BinanceProvider(),
    coingecko: new CoinGeckoProvider(),
    aster: new AsterProvider(),
  };

  /**
   * Récupère un provider par son nom
   */
  static getProvider(name = 'binance') {
    const provider = this.providers[name.toLowerCase()];
    if (!provider) {
      throw new Error(`Provider "${name}" not found. Available providers: ${Object.keys(this.providers).join(', ')}`);
    }
    return provider;
  }

  /**
   * Liste tous les providers disponibles
   */
  static listProviders() {
    return Object.keys(this.providers);
  }
}
