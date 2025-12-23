# 📡 Exemples de Requêtes API

Collection d'exemples pratiques pour tester l'API Bitcoin EMA.

## Health Check

```bash
curl http://localhost:3000/health
```

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

## Liste des Providers

```bash
curl http://localhost:3000/api/providers
```

## Candles - Exemples par Timeframe

### 1 minute (scalping)
```bash
curl "http://localhost:3000/api/btc/candles?interval=1m&limit=100&provider=binance"
```

### 5 minutes (day trading)
```bash
curl "http://localhost:3000/api/btc/candles?interval=5m&limit=288&provider=binance"
# 288 bougies = 24 heures
```

### 1 heure (swing trading)
```bash
curl "http://localhost:3000/api/btc/candles?interval=1h&limit=168&provider=binance"
# 168 bougies = 7 jours
```

### 6 heures (position trading)
```bash
curl "http://localhost:3000/api/btc/candles?interval=6h&limit=500&provider=binance"
# 500 bougies = ~125 jours
```

### 1 jour (long terme)
```bash
curl "http://localhost:3000/api/btc/candles?interval=1d&limit=365&provider=binance"
# 365 bougies = 1 an
```

## EMA - Configurations Populaires

### EMA 20 sur 6h (tendance moyen terme)
```bash
curl "http://localhost:3000/api/btc/ema?interval=6h&period=20&limit=500"
```

### EMA 50 sur 1d (tendance long terme)
```bash
curl "http://localhost:3000/api/btc/ema?interval=1d&period=50&limit=365"
```

### EMA 200 sur 1d (support/résistance majeur)
```bash
curl "http://localhost:3000/api/btc/ema?interval=1d&period=200&limit=365"
```

### EMA 9 sur 15m (trading rapide)
```bash
curl "http://localhost:3000/api/btc/ema?interval=15m&period=9&limit=200"
```

## Snapshot - Plusieurs EMAs

### Configuration classique (20, 50, 200)
```bash
curl "http://localhost:3000/api/btc/snapshot?interval=6h&periods=20,50,200&limit=500"
```

### Configuration trader actif (9, 21, 55)
```bash
curl "http://localhost:3000/api/btc/snapshot?interval=1h&periods=9,21,55&limit=300"
```

### Configuration long terme (50, 100, 200)
```bash
curl "http://localhost:3000/api/btc/snapshot?interval=1d&periods=50,100,200&limit=365"
```

### Configuration personnalisée
```bash
curl "http://localhost:3000/api/btc/snapshot?interval=4h&periods=10,20,30,50,100&limit=500"
```

## Signaux de Trading

### Signaux classiques 20/200 sur 6h
```bash
curl "http://localhost:3000/api/btc/signals?interval=6h&emaFast=20&emaSlow=200&limit=500"
```

### Signaux rapides 9/21 sur 1h
```bash
curl "http://localhost:3000/api/btc/signals?interval=1h&emaFast=9&emaSlow=21&limit=300"
```

### Signaux long terme 50/200 sur 1d
```bash
curl "http://localhost:3000/api/btc/signals?interval=1d&emaFast=50&emaSlow=200&limit=365"
```

### Signaux Golden/Death Cross classiques
```bash
curl "http://localhost:3000/api/btc/signals?interval=1d&emaFast=50&emaSlow=200&limit=500"
```

## Utilisation avec JavaScript/Axios

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Récupérer snapshot
async function getSnapshot() {
  const { data } = await axios.get(`${API_URL}/api/btc/snapshot`, {
    params: {
      interval: '6h',
      periods: '20,50,200',
      limit: 500,
      provider: 'binance'
    }
  });
  
  console.log('Latest price:', data.meta.latestPrice);
  console.log('Latest EMAs:', data.meta.latestEmas);
  console.log('Candles count:', data.candles.length);
}

// Récupérer signaux
async function getSignals() {
  const { data } = await axios.get(`${API_URL}/api/btc/signals`, {
    params: {
      interval: '6h',
      emaFast: 20,
      emaSlow: 200,
      limit: 500
    }
  });
  
  console.log('Trend:', data.signals.trend);
  console.log('Cross:', data.signals.cross);
  console.log('Price above slow EMA:', data.signals.priceAboveSlowEma);
}

getSnapshot();
getSignals();
```

## Utilisation avec Python/Requests

```python
import requests

API_URL = 'http://localhost:3000'

# Récupérer snapshot
def get_snapshot():
    response = requests.get(f'{API_URL}/api/btc/snapshot', params={
        'interval': '6h',
        'periods': '20,50,200',
        'limit': 500,
        'provider': 'binance'
    })
    
    data = response.json()
    print(f"Latest price: ${data['meta']['latestPrice']}")
    print(f"Latest EMAs: {data['meta']['latestEmas']}")
    print(f"Candles: {len(data['candles'])}")
    
    return data

# Récupérer signaux
def get_signals():
    response = requests.get(f'{API_URL}/api/btc/signals', params={
        'interval': '6h',
        'emaFast': 20,
        'emaSlow': 200,
        'limit': 500
    })
    
    data = response.json()
    signals = data['signals']
    
    print(f"Trend: {signals['trend']}")
    print(f"Cross: {signals['cross']}")
    print(f"Price above slow EMA: {signals['priceAboveSlowEma']}")
    
    return signals

snapshot = get_snapshot()
signals = get_signals()
```

## Cas d'Usage Pratiques

### Détecter un Golden Cross
```bash
# Surveiller EMA 50/200 sur daily
curl "http://localhost:3000/api/btc/signals?interval=1d&emaFast=50&emaSlow=200"
# Si cross: "golden" => Signal haussier fort
```

### Identifier les niveaux de support
```bash
# Prix vs EMA 200 sur daily
curl "http://localhost:3000/api/btc/ema?interval=1d&period=200&limit=365"
# EMA200 agit souvent comme support/résistance majeur
```

### Confirmer une tendance
```bash
# Toutes les EMAs alignées
curl "http://localhost:3000/api/btc/snapshot?interval=6h&periods=20,50,200"
# Si latestEmas: 20 > 50 > 200 => Tendance haussière forte
# Si latestEmas: 20 < 50 < 200 => Tendance baissière forte
```

### Timing d'entrée/sortie
```bash
# EMA courte sur petit timeframe
curl "http://localhost:3000/api/btc/ema?interval=15m&period=9&limit=200"
# Prix croise EMA9 => Signal d'entrée/sortie court terme
```

## Paramètres Recommandés

### Scalping (< 1 jour)
- Interval: 1m, 5m
- EMAs: 9, 21
- Limit: 100-300

### Day Trading (1-7 jours)
- Interval: 15m, 1h
- EMAs: 9, 21, 50
- Limit: 200-500

### Swing Trading (1-4 semaines)
- Interval: 4h, 6h
- EMAs: 20, 50, 200
- Limit: 500-1000

### Position Trading (> 1 mois)
- Interval: 1d
- EMAs: 50, 100, 200
- Limit: 365-1000

## Notes Importantes

1. **Cache** : Les données sont mises en cache 30 secondes par défaut
2. **Rate Limiting** : Le cache évite le rate limiting de Binance
3. **Provider** : Binance recommandé pour la précision
4. **Limite max** : 1000 bougies (limitation Binance)
5. **Timeframes** : Tous les timeframes ne sont pas disponibles sur tous les providers

## Monitoring en Continu

### Script Bash de surveillance
```bash
#!/bin/bash
while true; do
  echo "=== $(date) ==="
  curl -s "http://localhost:3000/api/btc/signals?interval=6h&emaFast=20&emaSlow=200" | jq '.signals.trend, .signals.cross, .signals.currentPrice'
  echo ""
  sleep 60
done
```

### Script Python de surveillance
```python
import requests
import time

while True:
    response = requests.get('http://localhost:3000/api/btc/signals', params={
        'interval': '6h',
        'emaFast': 20,
        'emaSlow': 200
    })
    
    signals = response.json()['signals']
    
    print(f"[{time.strftime('%H:%M:%S')}] Price: ${signals['currentPrice']:.2f} | Trend: {signals['trend']} | Cross: {signals['cross']}")
    
    time.sleep(60)
```

## Alertes Conditionnelles

```python
import requests
import time

ALERT_EMAIL = "your@email.com"
LAST_CROSS = None

while True:
    response = requests.get('http://localhost:3000/api/btc/signals', params={
        'interval': '1d',
        'emaFast': 50,
        'emaSlow': 200
    })
    
    signals = response.json()['signals']
    cross = signals['cross']
    
    if cross == 'golden' and LAST_CROSS != 'golden':
        print(f"🌟 ALERT: Golden Cross detected!")
        # Envoyer email/notification
        
    elif cross == 'death' and LAST_CROSS != 'death':
        print(f"💀 ALERT: Death Cross detected!")
        # Envoyer email/notification
    
    LAST_CROSS = cross
    time.sleep(300)  # Check every 5 minutes
```
