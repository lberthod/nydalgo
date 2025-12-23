# 🚀 Guide de Déploiement VPS

## Configuration VPS : 72.61.108.21

Ce guide explique comment déployer le Bitcoin Dashboard sur votre VPS.

## 📋 Prérequis

Votre VPS doit avoir :
- Ubuntu 20.04+ (ou autre distribution Linux)
- Node.js 18.x ou supérieur
- Git installé
- Accès SSH au VPS

## 🔧 Installation sur le VPS

### 1. Connexion SSH

```bash
ssh root@72.61.108.21
# ou
ssh votre-user@72.61.108.21
```

### 2. Installation de Node.js

```bash
# Installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

### 3. Installation de PM2 (gestionnaire de processus)

```bash
sudo npm install -g pm2
```

### 4. Cloner le projet

```bash
# Se placer dans le répertoire de votre choix
cd /var/www
# ou
cd ~/apps

# Cloner le repo
git clone https://github.com/votre-repo/nydalgo.git
cd nydalgo/backend
```

### 5. Installer les dépendances

```bash
npm install
```

### 6. Configuration

```bash
# Copier le fichier de config production
cp .env.production .env

# Éditer si nécessaire
nano .env
```

Contenu de `.env` :
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
CACHE_TTL_SECONDS=30
CORS_ORIGIN=*
```

### 7. Créer le dossier logs

```bash
mkdir -p logs
```

### 8. Démarrer l'API avec PM2

```bash
# Démarrer
npm run start:pm2

# Vérifier le statut
pm2 status

# Voir les logs
pm2 logs btc-dashboard-api

# Sauvegarder la config PM2
pm2 save

# Configurer le démarrage automatique au boot
pm2 startup
# Suivez les instructions affichées
```

## 🌐 Configuration du Firewall

### Ouvrir le port 3000

```bash
# UFW (Ubuntu)
sudo ufw allow 3000/tcp
sudo ufw status

# iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## ✅ Vérification

### Test local sur le VPS

```bash
curl http://localhost:3000/health
```

### Test depuis votre ordinateur

```bash
curl http://72.61.108.21:3000/health
```

Vous devriez voir :
```json
{
  "ok": true,
  "ts": 1703001234567,
  "uptime": 123.45,
  "cache": {...}
}
```

## 📡 Tester les Endpoints

```bash
# Healthcheck
curl http://72.61.108.21:3000/health

# Liste des providers
curl http://72.61.108.21:3000/api/providers

# Snapshot Bitcoin
curl http://72.61.108.21:3000/api/btc/snapshot?provider=binance&interval=6h

# Stats complètes
curl http://72.61.108.21:3000/api/btc/stats
```

## 🔄 Mise à jour du code

```bash
# Sur le VPS
cd /var/www/nydalgo/backend

# Pull les nouveaux changements
git pull

# Installer nouvelles dépendances si nécessaire
npm install

# Redémarrer l'API
npm run restart:pm2
```

## 📊 Gestion avec PM2

```bash
# Voir le statut
pm2 status

# Voir les logs en temps réel
pm2 logs btc-dashboard-api

# Redémarrer
pm2 restart btc-dashboard-api

# Arrêter
pm2 stop btc-dashboard-api

# Démarrer
pm2 start btc-dashboard-api

# Supprimer du PM2
pm2 delete btc-dashboard-api

# Voir les métriques
pm2 monit
```

## 🖥️ Configuration Frontend

Une fois le backend déployé, configurez le frontend pour pointer vers le VPS :

**Frontend `.env` :**
```env
VITE_API_URL=http://72.61.108.21:3000
```

## 🔒 Configuration HTTPS (Recommandé)

### Option 1 : Nginx Reverse Proxy

```bash
# Installer Nginx
sudo apt-get install nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/btc-api
```

Configuration Nginx :
```nginx
server {
    listen 80;
    server_name 72.61.108.21;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Activer la configuration
sudo ln -s /etc/nginx/sites-available/btc-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2 : Certbot pour SSL

```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir un certificat (nécessite un nom de domaine)
sudo certbot --nginx -d votre-domaine.com
```

## 📈 Monitoring

### Voir les ressources utilisées

```bash
pm2 monit
```

### Logs système

```bash
# Logs PM2
pm2 logs

# Logs spécifiques
tail -f /var/www/nydalgo/backend/logs/out.log
tail -f /var/www/nydalgo/backend/logs/err.log
```

## 🐛 Dépannage

### L'API ne démarre pas

```bash
# Vérifier les logs
pm2 logs btc-dashboard-api --lines 100

# Vérifier que le port n'est pas déjà utilisé
sudo netstat -tulpn | grep 3000

# Tuer le processus si nécessaire
sudo kill -9 <PID>
```

### Erreurs CORS

Vérifiez le `.env` :
```env
CORS_ORIGIN=*
```

Ou spécifiez votre domaine :
```env
CORS_ORIGIN=http://72.61.108.21:5173,https://votre-domaine.com
```

### Port non accessible

```bash
# Vérifier le firewall
sudo ufw status

# Vérifier que l'app écoute sur 0.0.0.0
sudo netstat -tulpn | grep 3000
```

## 🔐 Sécurité

### Recommandations

1. **Utilisez HTTPS** avec Nginx + Let's Encrypt
2. **Configurez CORS** spécifiquement (pas `*` en production)
3. **Rate limiting** : Ajoutez `express-rate-limit`
4. **Firewall** : N'ouvrez que les ports nécessaires
5. **Mises à jour** : Gardez Node.js et les dépendances à jour

### Rate Limiting (Optionnel)

```bash
npm install express-rate-limit
```

Ajoutez dans `index.js` :
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requêtes par IP
});

app.use('/api/', limiter);
```

## 📝 Architecture Production

```
Internet
    ↓
[Nginx :80/443] (reverse proxy + SSL)
    ↓
[Backend API :3000] (PM2)
    ↓
[Binance/Aster APIs]
```

## 🎯 URLs de Production

- **API Backend** : `http://72.61.108.21:3000`
- **Health Check** : `http://72.61.108.21:3000/health`
- **Docs API** : `http://72.61.108.21:3000/api`

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `pm2 logs btc-dashboard-api`
2. Vérifiez le statut : `pm2 status`
3. Testez le healthcheck : `curl http://localhost:3000/health`
4. Vérifiez le firewall : `sudo ufw status`

## ✨ Déploiement Automatique (CI/CD)

Pour automatiser les déploiements futurs, vous pouvez utiliser GitHub Actions :

Créez `.github/workflows/deploy.yml` :
```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: 72.61.108.21
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/nydalgo/backend
            git pull
            npm install
            pm2 restart btc-dashboard-api
```

---

**Le backend est maintenant prêt pour la production ! 🚀**
