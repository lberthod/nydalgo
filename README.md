# 📊 Bitcoin EMA Dashboard

Projet fullstack moderne pour afficher le prix Bitcoin en temps réel avec calcul d'EMA (Exponential Moving Average) dynamique.

## 🎯 Fonctionnalités

- **Données en temps réel** : Récupération des prix BTC depuis Binance, Aster ou CoinGecko
- **Calcul EMA dynamique** : EMA calculé sur les dernières bougies disponibles (rolling)
- **Dashboard interactif** : Interface Vue 3 moderne avec graphiques interactifs
- **Multi-timeframes** : Support de 1m, 5m, 15m, 30m, 1h, 4h, 6h, 1d
- **Multi-périodes EMA** : Configurez plusieurs EMAs simultanément (ex: 20, 50, 200)
- **Signaux de trading** : Détection de tendances, golden/death cross
- **Cache intelligent** : Système de cache pour limiter les appels API
- **Auto-refresh** : Mise à jour automatique des données

## 🏗️ Architecture

```
nydalgo/
├── backend/              # API Node.js + Express
│   ├── index.js         # Serveur principal (point d'entrée unique)
│   ├── src/
│   │   ├── providers/   # Abstraction des sources de données
│   │   │   ├── base.js
│   │   │   ├── binance.js
│   │   │   ├── coingecko.js
│   │   │   ├── aster.js
│   │   │   └── index.js
│   │   └── utils/       # Utilitaires (EMA, cache, signals)
│   │       ├── ema.js
│   │       ├── cache.js
│   │       └── signals.js
│   └── tests/           # Tests unitaires
└── frontend/            # Application Vue 3 + TypeScript
    ├── src/
    │   ├── components/  # Composants Vue
    │   ├── stores/      # Stores Pinia
    │   ├── services/    # Services API
    │   └── types/       # Définitions TypeScript
    └── index.html
```

## 🚀 Installation

### Prérequis

- Node.js >= 18.x
- npm ou yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'application démarre sur `http://localhost:5173`

## 📝 Configuration

### Backend (.env)

```env
PORT=3000                    # Port du serveur
CACHE_TTL_SECONDS=30        # Durée du cache en secondes
POLL_INTERVAL_SECONDS=10    # Intervalle de rafraîchissement
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

## 🔌 API Endpoints

### GET /health

Healthcheck du serveur.

**Réponse:**
```json
{
  "ok": true,
  "ts": 1703001234567,
  "uptime": 123.45,
  "cache": {
    "total": 5,
    "valid": 4,
    "expired": 1,
    "ttlSeconds": 30
  }
}
```

### GET /api/providers

Liste les providers de données disponibles.

**Réponse:**
```json
{
  "providers": ["binance", "coingecko"],
  "default": "binance"
}
```

### GET /api/btc/candles

Récupère les bougies OHLCV normalisées.

**Query params:**
- `interval` (default: `1h`) : 1m, 5m, 15m, 30m, 1h, 4h, 6h, 1d
- `limit` (default: `500`) : Nombre de bougies
- `provider` (default: `binance`) : binance, coingecko

**Exemple:**
```bash
curl "http://localhost:3000/api/btc/candles?interval=6h&limit=500&provider=binance"
```

**Réponse:**
```json
{
  "candles": [
    {
      "timestamp": 1703001234567,
      "open": 42000.50,
      "high": 42500.00,
      "low": 41800.00,
      "close": 42300.00,
      "volume": 1234.56
    }
  ],
  "meta": {
    "provider": "binance",
    "symbol": "BTCUSDT",
    "interval": "6h",
    "limit": 500,
    "lastUpdate": 1703001234567,
    "latestPrice": 42300.00
  }
}
```

### GET /api/btc/ema

Récupère les bougies avec calcul EMA.

**Query params:**
- `interval` (default: `1h`)
- `period` (default: `20`) : Période EMA
- `limit` (default: `500`)
- `provider` (default: `binance`)

**Exemple:**
```bash
curl "http://localhost:3000/api/btc/ema?interval=6h&period=20&limit=500"
```

**Réponse:**
```json
{
  "candles": [...],
  "ema": [null, null, ..., 42100.50, 42150.25],
  "meta": {
    "provider": "binance",
    "symbol": "BTCUSDT",
    "interval": "6h",
    "period": 20,
    "limit": 500,
    "lastUpdate": 1703001234567,
    "latestPrice": 42300.00,
    "latestEma": 42150.25,
    "priceAboveEma": true
  }
}
```

### GET /api/btc/snapshot

Récupère plusieurs EMAs en une seule requête.

**Query params:**
- `interval` (default: `1h`)
- `periods` (default: `20,50,200`) : Périodes EMA séparées par virgule
- `limit` (default: `500`)
- `provider` (default: `binance`)

**Exemple:**
```bash
curl "http://localhost:3000/api/btc/snapshot?interval=6h&periods=20,50,200&limit=500"
```

**Réponse:**
```json
{
  "candles": [...],
  "emas": {
    "20": [null, null, ..., 42100.50],
    "50": [null, null, ..., 41800.75],
    "200": [null, null, ..., 40500.25]
  },
  "meta": {
    "provider": "binance",
    "symbol": "BTCUSDT",
    "interval": "6h",
    "periods": [20, 50, 200],
    "limit": 500,
    "lastUpdate": 1703001234567,
    "latestPrice": 42300.00,
    "latestEmas": {
      "20": 42100.50,
      "50": 41800.75,
      "200": 40500.25
    }
  }
}
```

### GET /api/btc/signals

Analyse les signaux de trading basés sur les EMAs.

**Query params:**
- `interval` (default: `6h`)
- `emaFast` (default: `20`) : Période EMA rapide
- `emaSlow` (default: `200`) : Période EMA lente
- `limit` (default: `500`)
- `provider` (default: `binance`)

**Exemple:**
```bash
curl "http://localhost:3000/api/btc/signals?interval=6h&emaFast=20&emaSlow=200"
```

**Réponse:**
```json
{
  "signals": {
    "trend": "bullish",
    "cross": "none",
    "priceAboveFastEma": true,
    "priceAboveSlowEma": true,
    "currentPrice": 42300.00,
    "emaFast": {
      "period": 20,
      "value": 42100.50,
      "distance": 199.50,
      "distancePercent": 0.47
    },
    "emaSlow": {
      "period": 200,
      "value": 40500.25,
      "distance": 1799.75,
      "distancePercent": 4.44
    },
    "spread": {
      "value": 1600.25,
      "percent": 3.95
    }
  },
  "meta": {
    "provider": "binance",
    "symbol": "BTCUSDT",
    "interval": "6h",
    "emaFast": 20,
    "emaSlow": 200,
    "limit": 500,
    "lastUpdate": 1703001234567
  }
}
```

## 📐 Calcul EMA

### Formule

```
EMA[t] = close[t] * k + EMA[t-1] * (1 - k)
où k = 2 / (period + 1)
```

### Initialisation

L'EMA est initialisée avec une SMA (Simple Moving Average) sur les `period` premières valeurs.

Les valeurs avant d'avoir suffisamment de données sont `null`.

### Exemple

Pour une période de 5:
- k = 2 / (5 + 1) = 0.333
- EMA[0..3] = null
- EMA[4] = SMA des 5 premières closes
- EMA[5] = close[5] * 0.333 + EMA[4] * 0.667
- etc.

## 💾 Système de Cache

Le backend utilise un cache mémoire avec TTL (Time To Live) pour optimiser les performances:

- **Clé de cache** : `provider:symbol:interval:limit:extra`
- **TTL par défaut** : 30 secondes (configurable via `CACHE_TTL_SECONDS`)
- **Nettoyage automatique** : Toutes les 60 secondes
- **Avantages** : 
  - Réduit les appels API externes
  - Améliore les temps de réponse
  - Évite le rate limiting

## 🧪 Tests

### Backend

```bash
cd backend
npm test
```

Les tests couvrent:
- Calcul EMA avec valeurs connues
- Normalisation des données providers
- Conversion des intervalles

## 🎨 Frontend

### Technologies

- **Vue 3** : Framework progressif
- **TypeScript** : Typage statique
- **Pinia** : Store management
- **Vite** : Build tool ultra-rapide
- **Lightweight Charts** : Graphiques TradingView
- **Axios** : Client HTTP

### Composants

- **App.vue** : Application principale
- **ControlPanel.vue** : Panneau de contrôle (provider, interval, périodes)
- **PriceCard.vue** : Carte affichant le prix actuel
- **EMACard.vue** : Carte pour chaque EMA
- **ChartView.vue** : Graphique chandelier + EMAs
- **SignalsBadge.vue** : Badge des signaux de trading

### Store Pinia

Le `useMarketStore` gère:
- État des données (candles, emas, signals)
- Paramètres (provider, interval, periods, limit)
- Loading/error states
- Auto-refresh avec polling

## 🔄 Auto-refresh

Le frontend rafraîchit automatiquement les données:
- **Intervalle par défaut** : 10 secondes
- **Endpoints appelés** : `/api/btc/snapshot` + `/api/btc/signals`
- **Démarrage** : Automatique au montage du composant
- **Arrêt** : Automatique à la destruction du composant

## 🌐 Providers de Données

### Binance (Recommandé)

- **API** : Binance Public REST API
- **Endpoint** : `/api/v3/klines`
- **Avantages** :
  - Gratuit, sans clé API
  - Données OHLCV précises
  - Support natif des timeframes
  - Très fiable
- **Limitations** : Rate limit (évité grâce au cache)

### CoinGecko (Backup)

- **API** : CoinGecko Public API
- **Endpoint** : `/api/v3/coins/bitcoin/market_chart`
- **Avantages** :
  - Gratuit, sans clé API
  - Alternative si Binance indisponible
- **Limitations** :
  - Pas de timeframes précis (approximation)
  - Données moins granulaires
  - OHLC simulé à partir des prix

## 🚀 Extensibilité

### Ajouter un nouveau provider

1. Créer `backend/src/providers/mon-provider.js` :

```javascript
import { BaseProvider } from './base.js';

export class MonProvider extends BaseProvider {
  getName() {
    return 'mon-provider';
  }

  async fetchCandles(symbol, interval, limit) {
    // Implémenter la récupération
  }

  normalizeCandles(rawData) {
    // Normaliser au format standard
  }
}
```

2. Ajouter dans `backend/src/providers/index.js` :

```javascript
import { MonProvider } from './mon-provider.js';

export class ProviderFactory {
  static providers = {
    binance: new BinanceProvider(),
    coingecko: new CoinGeckoProvider(),
    'mon-provider': new MonProvider(),
  };
}
```

## 📊 Signaux de Trading

Le système détecte:

- **Tendance** : `bullish` (EMA rapide > EMA lente), `bearish` (inverse), `neutral`
- **Croisements** :
  - `golden` : Golden Cross (EMA rapide croise au-dessus)
  - `death` : Death Cross (EMA rapide croise en-dessous)
  - `none` : Pas de croisement récent
- **Positions prix/EMA** : Prix au-dessus/en-dessous de chaque EMA
- **Spread** : Distance entre les deux EMAs

**Note** : Ces signaux sont à titre informatif uniquement. Aucun ordre de trading n'est exécuté.

## 🔮 Évolutions Futures

- [ ] WebSocket pour données temps réel (au lieu du polling)
- [ ] Support de plusieurs paires crypto (ETH, etc.)
- [ ] Alertes personnalisées (prix, croisements EMA)
- [ ] Export des données (CSV, JSON)
- [ ] Backtesting de stratégies EMA
- [ ] Mode algo trading (papier trading)
- [ ] Authentification utilisateur
- [ ] Sauvegarde des configurations
- [ ] Support de plus d'indicateurs (RSI, MACD, Bollinger)

## 📄 Licence

MIT

## 👨‍💻 Développement

### Scripts disponibles

**Backend:**
```bash
npm run dev    # Mode développement (watch)
npm start      # Production
npm test       # Tests
```

**Frontend:**
```bash
npm run dev     # Mode développement
npm run build   # Build production
npm run preview # Preview du build
```

### Structure de code

Le code suit les principes:
- **Séparation des responsabilités** : Providers, utils, composants séparés
- **Typage fort** : TypeScript sur le frontend
- **Commentaires** : Code bien documenté
- **Modularité** : Facile d'ajouter des providers ou indicateurs
- **Clean code** : Nommage explicite, fonctions courtes

## 🐛 Troubleshooting

### Le backend ne démarre pas

- Vérifiez que Node.js >= 18 est installé
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Essayez de changer le port dans `.env`

### Erreur CORS

Le backend utilise CORS avec `*`. Si problème, vérifiez la configuration dans `index.js`.

### Données ne se chargent pas

- Vérifiez que le backend est bien démarré
- Testez l'endpoint directement : `curl http://localhost:3000/health`
- Regardez les logs du backend pour les erreurs
- Vérifiez votre connexion internet (requêtes vers Binance)

### Cache trop agressif

Ajustez `CACHE_TTL_SECONDS` dans `.env` du backend (minimum recommandé : 10s).

## 📚 Ressources

- [Binance API Documentation](https://binance-docs.github.io/apidocs/spot/en/)
- [CoinGecko API Documentation](https://www.coingecko.com/en/api/documentation)
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
- [EMA on Investopedia](https://www.investopedia.com/terms/e/ema.asp)
# nydalgo
