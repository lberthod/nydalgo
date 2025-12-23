# Backend - Bitcoin EMA API

API Node.js pour récupérer les données Bitcoin et calculer les EMAs.

## Architecture

```
backend/
├── index.js              # Serveur Express (point d'entrée)
├── src/
│   ├── providers/        # Abstraction des sources de données
│   │   ├── base.js      # Interface de base
│   │   ├── binance.js   # Provider Binance
│   │   ├── coingecko.js # Provider CoinGecko
│   │   └── index.js     # Factory
│   └── utils/
│       ├── ema.js       # Calculs EMA
│       ├── cache.js     # Système de cache
│       └── signals.js   # Analyse de signaux
└── tests/               # Tests unitaires
```

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

## Endpoints

Voir le README principal pour la documentation complète des endpoints.

## Tests

```bash
npm test
```

## Cache

Le système de cache évite de surcharger les APIs externes:
- Clé : `provider:symbol:interval:limit:extra`
- TTL : 30 secondes par défaut
- Nettoyage automatique : 60 secondes

## Providers

### Ajouter un provider

1. Créer une classe héritant de `BaseProvider`
2. Implémenter `fetchCandles` et `normalizeCandles`
3. Ajouter dans `ProviderFactory`

Exemple minimaliste:

```javascript
import { BaseProvider } from './base.js';

export class MyProvider extends BaseProvider {
  getName() { return 'my-provider'; }
  
  async fetchCandles(symbol, interval, limit) {
    const response = await fetch(`https://api.example.com/data`);
    const data = await response.json();
    return this.normalizeCandles(data);
  }
  
  normalizeCandles(rawData) {
    return rawData.map(item => ({
      timestamp: item.time,
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v
    }));
  }
}
```
