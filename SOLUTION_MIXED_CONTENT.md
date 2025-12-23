# 🔒 Solution Mixed Content - HTTPS → HTTP

## Problème actuel

- **Frontend** : `https://nydalgo.web.app` (HTTPS ✅)
- **Backend** : `http://72.61.108.21:3000` (HTTP ❌)
- **Erreur** : Mixed Content bloqué par le navigateur

## 🚀 Solutions par ordre de facilité

### Solution 1 : Cloudflare Tunnel (RAPIDE - 5 min)

#### Sur le VPS

```bash
# Installation
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Lancer le tunnel
cloudflared tunnel --url http://localhost:3000
```

**Résultat** : Tu obtiens une URL HTTPS publique type `https://abc-xyz.trycloudflare.com`

#### Configuration Frontend

```bash
# Mettre l'URL dans .env.production
VITE_API_URL=https://abc-xyz.trycloudflare.com

# Rebuild et redeploy
npm run build
firebase deploy
```

✅ **HTTPS fixé !**

#### Tunnel permanent (optionnel)

```bash
# Authentifier avec Cloudflare (créer compte gratuit)
cloudflared tunnel login

# Créer tunnel nommé
cloudflared tunnel create btc-dashboard

# Obtenir l'ID du tunnel (noté quelque part)

# Créer config
nano ~/.cloudflared/config.yml
```

`config.yml` :
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: btc-api.votredomaine.com
    service: http://localhost:3000
  - service: http_status:404
```

```bash
# Router le tunnel (dans Cloudflare Dashboard)
cloudflared tunnel route dns btc-dashboard btc-api.votredomaine.com

# Lancer en service
cloudflared tunnel run btc-dashboard

# Ou avec systemd
sudo cloudflared service install
```

---

### Solution 2 : Nginx + Let's Encrypt (PROPRE - 15 min)

**Nécessite** : Un nom de domaine pointant vers 72.61.108.21

#### Sur le VPS

```bash
# Installation
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Configuration Nginx
sudo nano /etc/nginx/sites-available/btc-api
```

`/etc/nginx/sites-available/btc-api` :
```nginx
server {
    listen 80;
    server_name api.votredomaine.com;  # Remplacer

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer
sudo ln -s /etc/nginx/sites-available/btc-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Certificat SSL automatique
sudo certbot --nginx -d api.votredomaine.com

# Auto-renewal
sudo certbot renew --dry-run
```

#### Configuration Frontend

```env
VITE_API_URL=https://api.votredomaine.com
```

```bash
npm run build
firebase deploy
```

✅ **HTTPS avec nom de domaine custom !**

---

### Solution 3 : Firebase Rewrites + Cloud Function (ÉLÉGANT - 20 min)

Créer une Cloud Function qui proxy vers le VPS.

#### Créer la fonction

```bash
cd functions
npm install axios
```

`functions/index.js` :
```javascript
const functions = require('firebase-functions');
const axios = require('axios');

const VPS_URL = 'http://72.61.108.21:3000';

exports.api = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const response = await axios({
      method: req.method,
      url: `${VPS_URL}${req.path}`,
      params: req.query,
      data: req.body,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Proxy error',
      message: error.message
    });
  }
});
```

#### Configuration Hosting

`firebase.json` :
```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### Frontend

```env
VITE_API_URL=https://nydalgo.web.app
```

Dans le code, appelle `/api/btc/snapshot`, `/api/btc/stats`, etc.

```bash
# Deploy
firebase deploy --only functions,hosting
```

✅ **Même domaine + HTTPS + Pas de CORS !**

---

### Solution 4 : ngrok (DEV SEULEMENT - 2 min)

```bash
# Sur le VPS
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Créer compte sur ngrok.com et obtenir authtoken

ngrok authtoken <YOUR_TOKEN>
ngrok http 3000
```

URL HTTPS : `https://abc123.ngrok.io`

⚠️ **Gratuit mais URL change à chaque redémarrage**

---

## 🎯 Recommandation pour ton cas

### Pour tester rapidement (5 min)
**Cloudflare Tunnel** : Simple, gratuit, HTTPS immédiat

### Pour la production (15 min)
**Nginx + Let's Encrypt** : Si tu as un domaine

### Pour l'élégance (20 min)
**Firebase Functions** : Même domaine, pas de CORS, scaling auto

---

## ⚡ Quick Start - Cloudflare Tunnel

```bash
# Sur VPS
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
cloudflared tunnel --url http://localhost:3000

# Note l'URL HTTPS affichée (ex: https://abc.trycloudflare.com)

# Local - Frontend
cd frontend
echo "VITE_API_URL=https://abc.trycloudflare.com" > .env.production
npm run build
firebase deploy

# ✅ DONE!
```

---

## 🧪 Test après fix

```bash
# Ouvrir https://nydalgo.web.app
# Console navigateur :
fetch('/api/btc/health')
  .then(r => r.json())
  .then(console.log)

# Devrait afficher : { ok: true, ... }
```

---

## 📊 Comparaison des solutions

| Solution | Temps | Domaine requis | Coût | Permanent | Difficulté |
|----------|-------|----------------|------|-----------|------------|
| Cloudflare Tunnel | 5 min | Non | Gratuit | Oui | ⭐ |
| ngrok | 2 min | Non | Gratuit* | Non | ⭐ |
| Nginx + SSL | 15 min | Oui | Gratuit | Oui | ⭐⭐ |
| Firebase Functions | 20 min | Non | Gratuit** | Oui | ⭐⭐⭐ |

*ngrok gratuit = URL change à chaque restart  
**Firebase Functions = 2M invocations gratuites/mois

---

## 🔒 Sécurité

Après avoir fixé HTTPS, pense à :

1. **Restreindre CORS** sur le backend :
```env
CORS_ORIGIN=https://nydalgo.web.app
```

2. **Rate limiting** (si Firebase Functions) :
Déjà inclus par défaut

3. **Firewall VPS** :
```bash
sudo ufw allow 3000/tcp  # Seulement si Cloudflare/Nginx
```

---

**Quelle solution veux-tu implémenter ?**
