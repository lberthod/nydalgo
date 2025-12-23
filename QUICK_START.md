# 🚀 Quick Start Guide

Guide de démarrage rapide pour lancer le projet en 5 minutes.

## Installation en une commande

```bash
# Installer toutes les dépendances (backend + frontend)
npm run install:all
```

Ou manuellement:

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

## Lancer l'application

### Option 1 : Tout en même temps (recommandé)

```bash
# À la racine du projet
npm run dev
```

Cela lancera le backend ET le frontend simultanément.

### Option 2 : Séparément

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Accéder à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Health check** : http://localhost:3000/health

## Premiers tests

### Tester l'API directement

```bash
# Health check
curl http://localhost:3000/health

# Récupérer des bougies BTC
curl "http://localhost:3000/api/btc/candles?interval=1h&limit=100"

# Récupérer EMA20 sur 6h
curl "http://localhost:3000/api/btc/ema?interval=6h&period=20&limit=500"

# Récupérer snapshot avec plusieurs EMAs
curl "http://localhost:3000/api/btc/snapshot?interval=6h&periods=20,50,200"

# Analyser les signaux de trading
curl "http://localhost:3000/api/btc/signals?interval=6h&emaFast=20&emaSlow=200"
```

## Configuration rapide

Créer les fichiers `.env` (optionnel, les valeurs par défaut fonctionnent):

**backend/.env:**
```env
PORT=3000
CACHE_TTL_SECONDS=30
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:3000
```

## Utilisation du Dashboard

1. Ouvrir http://localhost:5173
2. Choisir le provider (Binance recommandé)
3. Choisir l'interval (6h recommandé pour voir les tendances)
4. Configurer les périodes EMA (20, 50, 200 par défaut)
5. Le dashboard se rafraîchit automatiquement toutes les 10 secondes

## Exemples de configurations

### Trading intraday
- Interval: 5m ou 15m
- EMAs: 9, 21, 50
- Limite: 500 bougies

### Trading swing
- Interval: 4h ou 6h
- EMAs: 20, 50, 200
- Limite: 500 bougies

### Trading long terme
- Interval: 1d
- EMAs: 50, 100, 200
- Limite: 365 bougies

## Résolution de problèmes

### Port déjà utilisé

**Backend (port 3000):**
```bash
# Changer dans backend/.env
PORT=3001
```

**Frontend (port 5173):**
```bash
# Changer dans frontend/vite.config.ts
server: {
  port: 5174
}
```

### Erreur de connexion API

Vérifier que le backend est bien démarré:
```bash
curl http://localhost:3000/health
```

Si erreur, redémarrer le backend:
```bash
cd backend
npm run dev
```

### Cache trop agressif

Réduire le TTL dans `backend/.env`:
```env
CACHE_TTL_SECONDS=10
```

## Tester le code

```bash
# Tests backend
cd backend
npm test
```

## Build pour production

```bash
# Frontend
cd frontend
npm run build

# Les fichiers sont dans frontend/dist/
```

Le backend n'a pas besoin de build, il s'exécute directement avec Node.js.

## Prochaines étapes

- Consulter le [README principal](./README.md) pour la doc complète
- Explorer les différents endpoints API
- Personnaliser les périodes EMA selon votre stratégie
- Analyser les signaux de trading
- Tester différents timeframes

## Support

En cas de problème:
1. Vérifier que Node.js >= 18 est installé
2. Vérifier les logs dans les terminaux
3. Consulter la section Troubleshooting du README
4. Tester les endpoints API directement avec curl
