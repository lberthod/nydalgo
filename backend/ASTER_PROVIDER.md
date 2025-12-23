# Provider Aster pour Bitcoin Dashboard

## Vue d'ensemble

Le provider Aster permet de récupérer les données Bitcoin depuis l'API Aster (https://fapi.asterdex.com), une plateforme d'exchange de contrats à terme (futures).

## Configuration

Aucune clé API n'est nécessaire pour utiliser les endpoints publics (market data).

## Utilisation

### Via l'API Backend

Ajoutez le paramètre `provider=aster` à vos requêtes :

```bash
# Snapshot avec EMAs
curl "http://localhost:3000/api/btc/snapshot?provider=aster&interval=1h&periods=20,50,200&limit=500"

# Statistiques complètes
curl "http://localhost:3000/api/btc/stats?provider=aster&interval=1h&limit=1000"

# Signaux de trading
curl "http://localhost:3000/api/btc/signals?provider=aster&interval=6h&emaFast=20&emaSlow=200"
```

### Via le Frontend

Sélectionnez "aster" dans le dropdown "Provider" du panneau de contrôle.

## Symboles supportés

- **BTCUSDT** : Bitcoin vs Tether (USDT)
- Tous les symboles perpetual futures d'Aster

## Intervalles supportés

- Minutes : `1m`, `3m`, `5m`, `15m`, `30m`
- Heures : `1h`, `2h`, `4h`, `6h`, `8h`, `12h`
- Jours : `1d`, `3d`
- Semaines : `1w`
- Mois : `1M`

## Limites

- **Max candles par requête** : 1500
- **Rate limit** : 2400 requêtes/minute (REQUEST_WEIGHT)
- **Pas d'authentification requise** pour market data

## Format des données

L'API Aster retourne les klines au format suivant :

```json
[
  [
    1499040000000,      // Open time
    "0.01634790",       // Open
    "0.80000000",       // High
    "0.01575800",       // Low
    "0.01577100",       // Close
    "148976.11427815",  // Volume
    1499644799999,      // Close time
    "2434.19055334",    // Quote asset volume
    308,                // Number of trades
    "1756.87402397",    // Taker buy base asset volume
    "28.46694368",      // Taker buy quote asset volume
    "17928899.62484339" // Ignore
  ]
]
```

Notre provider normalise automatiquement ces données au format standard :

```typescript
{
  timestamp: number,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
}
```

## Endpoints Aster utilisés

### Kline/Candlestick Data
- **URL** : `GET /fapi/v1/klines`
- **Documentation** : [Aster API Docs](https://docs.aster.com)
- **Weight** : Basé sur le paramètre LIMIT
  - [1,100) = 1
  - [100, 500) = 2
  - [500, 1000] = 5
  - 1000+ = 10

## Avantages du provider Aster

✅ **Pas de clé API nécessaire** pour les données publiques  
✅ **Haute fréquence** : Jusqu'à 1500 candles par requête  
✅ **Rate limits généreux** : 2400 req/min  
✅ **Données temps réel** : Mises à jour continues  
✅ **Multi-timeframes** : Support complet des intervalles  

## Comparaison avec autres providers

| Feature | Aster | Binance | CoinGecko |
|---------|-------|---------|-----------|
| Auth requise | ❌ Non | ❌ Non | ❌ Non |
| Max candles | 1500 | 1500 | ~365 |
| Rate limit | 2400/min | 2400/min | 50/min |
| Intervalles | 15 | 15+ | Limité |
| Latence | Faible | Très faible | Moyenne |
| WebSocket | ✅ Oui | ✅ Oui | ❌ Non |

## Cas d'usage recommandés

### 📊 Trading actif
Utilisez Aster pour :
- Analyse technique intraday
- Backtesting de stratégies
- Monitoring en temps réel
- Calculs EMA précis

### 🔄 Fallback
Aster peut servir de backup si Binance est indisponible.

### 🌐 Diversification
Combinez plusieurs sources pour validation croisée des données.

## Implémentation technique

### Structure du provider

```javascript
// backend/src/providers/aster.js
export class AsterProvider extends BaseProvider {
  constructor() {
    super('aster');
    this.baseUrl = 'https://fapi.asterdex.com';
  }

  async fetchCandles(symbol, interval, limit = 500) {
    // Implémentation complète dans le fichier
  }

  convertInterval(interval) {
    // Mapping des intervalles
  }

  normalizeCandles(data) {
    // Normalisation au format standard
  }
}
```

### Ajout au ProviderFactory

```javascript
// backend/src/providers/index.js
import { AsterProvider } from './aster.js';

export class ProviderFactory {
  static providers = {
    binance: new BinanceProvider(),
    coingecko: new CoinGeckoProvider(),
    aster: new AsterProvider()  // ✅ Nouveau
  };
}
```

## Gestion des erreurs

Le provider Aster gère automatiquement :

- ❌ **400 Bad Request** : Paramètres invalides
- ❌ **403 Forbidden** : Rate limit dépassé
- ❌ **429 Too Many Requests** : Trop de requêtes
- ❌ **500 Internal Server Error** : Erreur serveur Aster
- ❌ **Network errors** : Timeout, DNS, etc.

En cas d'erreur, le message est propagé avec contexte :
```
Failed to fetch from Aster: Aster API error: 400 Bad Request
```

## Cache

Le système de cache backend s'applique également à Aster :
- **TTL** : 30 secondes (configurable via `CACHE_TTL_SECONDS`)
- **Clés** : `provider:symbol:interval:limit:type`
- **Bénéfice** : Réduit les appels API et améliore la performance

## Tests

Pour tester le provider Aster :

```bash
# Test direct de l'endpoint
curl "https://fapi.asterdex.com/fapi/v1/klines?symbol=BTCUSDT&interval=1h&limit=100"

# Test via notre backend
curl "http://localhost:3000/api/btc/snapshot?provider=aster"

# Vérifier les providers disponibles
curl "http://localhost:3000/api/providers"
```

## Monitoring

Le backend log automatiquement les requêtes :
```
[2025-12-23T14:27:45.197Z] GET /api/btc/snapshot?provider=aster
[2025-12-23T14:27:45.215Z] GET /api/btc/stats?provider=aster
```

## Future améliorations possibles

- 🔮 **WebSocket streams** : Intégration des streams temps réel
- 📊 **Plus de symboles** : Support altcoins (ETHUSDT, etc.)
- 🔑 **Authenticated endpoints** : Trading, positions, orders
- 📈 **Order book data** : Depth, bid/ask spreads
- 💹 **Funding rates** : Taux de financement perpetuals

## Support

Documentation officielle Aster :
- API Docs : https://github.com/asterdex/api-docs
- Base URL : https://fapi.asterdex.com
- WebSocket : wss://fstream.asterdex.com

## Licence

Ce provider est fourni dans le cadre du Bitcoin EMA Dashboard sous licence MIT.
