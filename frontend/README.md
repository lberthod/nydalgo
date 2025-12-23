# Frontend - Bitcoin EMA Dashboard

Application Vue 3 + TypeScript pour afficher les données BTC et EMAs.

## Technologies

- Vue 3 (Composition API)
- TypeScript
- Pinia (state management)
- Vite (build tool)
- Lightweight Charts (TradingView)
- Axios

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

Ouvrir http://localhost:5173

## Structure

```
frontend/src/
├── components/           # Composants Vue
│   ├── App.vue          # Application principale
│   ├── ControlPanel.vue # Panneau de contrôle
│   ├── PriceCard.vue    # Carte prix
│   ├── EMACard.vue      # Carte EMA
│   ├── ChartView.vue    # Graphique
│   └── SignalsBadge.vue # Badge signaux
├── stores/
│   └── market.ts        # Store Pinia
├── services/
│   └── api.ts           # Service API
└── types/
    └── index.ts         # Types TypeScript
```

## Composants

### ControlPanel
Panneau de configuration permettant de changer:
- Provider (Binance/CoinGecko)
- Interval (1m, 5m, 1h, 6h, etc.)
- Périodes EMA (ajouter/retirer)
- Limite de bougies

### ChartView
Graphique chandelier avec EMAs superposées utilisant Lightweight Charts.

### PriceCard / EMACard
Cartes affichant prix actuel et valeurs EMAs avec indicateurs visuels.

### SignalsBadge
Badge montrant tendance, croisements, et métriques des EMAs.

## Store Pinia

Le `useMarketStore` centralise:
- Données (candles, emas, signals)
- Paramètres (provider, interval, periods)
- États (loading, error)
- Actions (fetch, refresh, auto-refresh)

## Auto-refresh

Refresh automatique toutes les 10 secondes (configurable):
```typescript
const marketStore = useMarketStore()
marketStore.refreshInterval = 15000 // 15 secondes
```

## Build Production

```bash
npm run build
```

Les fichiers sont générés dans `dist/`.

Pour prévisualiser:
```bash
npm run preview
```
