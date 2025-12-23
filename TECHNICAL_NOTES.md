# 📝 Notes Techniques

Documentation des choix techniques et de l'architecture du projet.

## Choix d'Architecture

### Backend

**Framework:** Express.js
- Simple, léger, bien documenté
- Parfait pour une API REST
- Écosystème mature

**Structure modulaire:**
```
src/
├── providers/   # Pattern Strategy pour les sources de données
├── utils/       # Logique métier isolée
```

**Pattern Provider:**
- Interface `BaseProvider` pour abstraction
- Facilite l'ajout de nouvelles sources
- Chaque provider normalise ses données au même format

**Système de Cache:**
- Cache mémoire (Map JavaScript)
- TTL configurable
- Nettoyage automatique périodique
- Clé composite: `provider:symbol:interval:limit:extra`

**Avantages:**
- Réduit la charge sur APIs externes
- Améliore les temps de réponse
- Évite le rate limiting

### Frontend

**Framework:** Vue 3 Composition API
- Réactivité moderne
- TypeScript first-class support
- Performance optimale

**State Management:** Pinia
- Plus simple que Vuex
- Excellent support TypeScript
- API intuitive

**Charting:** Lightweight Charts (TradingView)
- Performance exceptionnelle
- API complète pour trading
- Léger (~50KB gzipped)

**Build Tool:** Vite
- Démarrage ultra-rapide (HMR)
- Build optimisé
- Support TypeScript natif

## Calcul EMA

### Implémentation

```javascript
k = 2 / (period + 1)
EMA[t] = close[t] * k + EMA[t-1] * (1 - k)
```

**Initialisation:** SMA sur les N premières valeurs
- Plus précis que d'utiliser la première close
- Standard dans l'industrie

**Valeurs null:**
- Les N-1 premières valeurs sont `null`
- Permet au frontend de savoir qu'il n'y a pas assez de données

### Complexité

- Temps: O(n) où n = nombre de closes
- Espace: O(n) pour stocker les résultats
- Optimisation possible: calcul streaming pour temps réel

## Système de Signaux

### Détection de Tendance

```
Bullish: EMA_fast > EMA_slow
Bearish: EMA_fast < EMA_slow
Neutral: EMA_fast ≈ EMA_slow
```

### Détection de Croisements

**Golden Cross:**
```
EMA_fast[t-1] <= EMA_slow[t-1] AND
EMA_fast[t] > EMA_slow[t]
```

**Death Cross:**
```
EMA_fast[t-1] >= EMA_slow[t-1] AND
EMA_fast[t] < EMA_slow[t]
```

**Robustesse:**
- Vérifie 2 points temporels
- Évite les faux signaux dus à la volatilité
- Simple mais efficace

## Providers de Données

### Binance

**Endpoint:** `GET /api/v3/klines`

**Format de réponse:**
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
    ...
  ]
]
```

**Avantages:**
- Données très précises
- Timeframes natifs
- Pas d'authentification requise
- Rate limit généreux (1200 req/min)

**Limitations:**
- Max 1000 bougies par requête
- Nécessite connexion internet

### CoinGecko

**Endpoint:** `GET /api/v3/coins/bitcoin/market_chart`

**Format de réponse:**
```json
{
  "prices": [[timestamp, price], ...],
  "market_caps": [[timestamp, cap], ...],
  "total_volumes": [[timestamp, volume], ...]
}
```

**Avantages:**
- Backup si Binance down
- Pas d'authentification
- Données historiques longues

**Limitations:**
- Pas de timeframes précis
- OHLC simulé (seulement prix disponibles)
- Rate limit plus strict (50 req/min)

## Gestion des Erreurs

### Backend

**Stratégie:**
```javascript
try {
  // Fetch data
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Message utilisateur',
    message: error.message
  });
}
```

**Logged mais pas exposé:**
- Stack traces restent serveur
- Messages d'erreur simplifiés pour client

### Frontend

**Stratégie:**
```typescript
try {
  loading.value = true
  await fetchData()
} catch (err: any) {
  error.value = err.message || 'Failed to fetch'
} finally {
  loading.value = false
}
```

**UX:**
- Banner d'erreur visible
- Message clair
- Loading states appropriés

## Performance

### Backend

**Optimisations:**
- Cache mémoire (évite requêtes réseau)
- Réponse en streaming si besoin futur
- Pas de calculs inutiles

**Métriques typiques:**
- 1ère requête: ~500-1000ms (fetch externe)
- Requêtes cachées: ~1-5ms
- Calcul EMA: ~1ms pour 500 points

### Frontend

**Optimisations:**
- Code splitting automatique (Vite)
- Lazy loading des composants si besoin
- Chart optimisé (Lightweight Charts)
- Throttling sur auto-refresh

**Métriques typiques:**
- First Paint: ~500ms
- Time to Interactive: ~1s
- Chart render: ~100ms pour 500 bougies

## Sécurité

### Backend

**Mesures:**
- CORS activé (configurable)
- Pas de données sensibles exposées
- Validation des paramètres (parseInt, etc.)
- Rate limiting possible (à ajouter si besoin)

**À améliorer pour production:**
- Rate limiting par IP
- Authentification si données sensibles
- HTTPS obligatoire
- Helmet.js pour headers sécurisés

### Frontend

**Mesures:**
- Pas de secrets dans le code
- Variables d'environnement pour config
- CSP headers possibles

## Scalabilité

### Backend

**Actuellement:**
- Mono-instance
- Cache en mémoire (non partagé)

**Pour scaler:**
- Redis pour cache distribué
- Load balancer (Nginx)
- Horizontal scaling possible
- WebSocket pour temps réel

### Frontend

**Actuellement:**
- Static site (après build)
- CDN-ready

**Pour scaler:**
- Deploy sur CDN (Netlify, Vercel, Cloudflare)
- Service Worker pour cache
- Server-side rendering si SEO important

## Testing

### Backend

**Tests actuels:**
- Tests unitaires EMA (valeurs connues)
- Tests providers (normalisation)

**À ajouter:**
- Tests d'intégration (endpoints)
- Tests de charge (K6, Artillery)
- Tests E2E (Playwright)

### Frontend

**À ajouter:**
- Tests composants (Vitest + Testing Library)
- Tests E2E (Playwright, Cypress)
- Tests snapshot (UI consistency)

## Monitoring

**À ajouter pour production:**

**Backend:**
- Logs structurés (Winston, Pino)
- Métriques (Prometheus)
- Tracing (OpenTelemetry)
- Health checks avancés

**Frontend:**
- Error tracking (Sentry)
- Analytics (Plausible, Fathom)
- Performance monitoring (Web Vitals)

## Évolutions Futures

### Court terme
- [ ] WebSocket pour push temps réel
- [ ] Plus d'indicateurs (RSI, MACD, Bollinger)
- [ ] Support multi-crypto (ETH, etc.)
- [ ] Alertes customisables

### Moyen terme
- [ ] Authentification utilisateur
- [ ] Sauvegarde des configurations
- [ ] Backtesting de stratégies
- [ ] Export de données

### Long terme
- [ ] Mode paper trading
- [ ] Social features (partage de configs)
- [ ] Mobile app (React Native)
- [ ] AI-powered signals

## Dépendances Clés

### Backend
```json
{
  "express": "^4.18.2",      // Web framework
  "cors": "^2.8.5",          // CORS middleware
  "dotenv": "^16.3.1"        // Variables d'environnement
}
```

### Frontend
```json
{
  "vue": "^3.4.0",           // Framework
  "pinia": "^2.1.7",         // State management
  "lightweight-charts": "^4.1.3",  // Charting
  "axios": "^1.6.5",         // HTTP client
  "vite": "^5.0.0",          // Build tool
  "typescript": "^5.3.3"     // Type safety
}
```

**Pourquoi ces versions:**
- Dernières stables au moment du dev
- Compatibilité testée
- Pas de breaking changes connus

## Conventions de Code

### Backend

- Modules ES6 (`import`/`export`)
- JSDoc pour documentation
- Nommage: camelCase
- Async/await pour asynchrone

### Frontend

- Composition API (pas Options API)
- TypeScript strict
- Composants SFC (Single File Component)
- Props/Emits typés
- Nommage: PascalCase pour composants

## Structure des Données

### Candle (format normalisé)
```typescript
{
  timestamp: number,  // Unix ms
  open: number,       // Prix ouverture
  high: number,       // Prix max
  low: number,        // Prix min
  close: number,      // Prix fermeture
  volume: number      // Volume
}
```

### Meta (métadonnées)
```typescript
{
  provider: string,
  symbol: string,
  interval: string,
  period?: number,
  limit: number,
  lastUpdate: number,
  latestPrice: number,
  latestEma?: number
}
```

## Best Practices Suivies

1. **Séparation des préoccupations** : UI / State / Business Logic / Data
2. **DRY** : Pas de duplication de code
3. **KISS** : Solutions simples et claires
4. **SOLID** : Principes OO respectés (providers)
5. **Type safety** : TypeScript côté frontend
6. **Documentation** : Code commenté, README complet
7. **Testabilité** : Code facilement testable

## Limitations Connues

1. **Cache mémoire** : Perdu au redémarrage
2. **Pas de persistance** : Pas de base de données
3. **Single provider** : Un seul provider à la fois
4. **Polling** : Pas de WebSocket (encore)
5. **Rate limiting** : Pas implémenté côté serveur

Ces limitations sont volontaires pour un MVP mais peuvent être levées facilement.

## Resources & Références

- [Binance API Docs](https://binance-docs.github.io/apidocs/)
- [Vue 3 Docs](https://vuejs.org/)
- [Lightweight Charts Docs](https://tradingview.github.io/lightweight-charts/)
- [EMA on Investopedia](https://www.investopedia.com/terms/e/ema.asp)
- [Trading Strategy Wiki](https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average)
