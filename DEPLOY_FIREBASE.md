# 🔥 Déploiement Frontend sur Firebase Hosting

## Configuration actuelle

- **Backend VPS** : http://72.61.108.21:3000
- **Frontend** : Firebase Hosting (gratuit)

## 🚀 Déploiement en 3 étapes

### 1. Configuration de l'environnement

Le fichier `.env.production` est déjà configuré :
```env
VITE_API_URL=http://72.61.108.21:3000
```

### 2. Build du frontend

```bash
cd frontend
npm run build
```

Cela créera un dossier `dist/` avec tous les fichiers optimisés.

### 3. Déploiement sur Firebase

```bash
firebase deploy
```

## ✅ URLs finales

- **Frontend** : `https://nydalgo.web.app` (ou votre URL Firebase)
- **Backend** : `http://72.61.108.21:3000`

## 🔧 Configuration Firebase

Le fichier `firebase.json` est configuré pour :
- Public directory : `dist`
- Single Page App : Non (pour index.html statique)

### Si vous voulez une SPA complète

Modifiez `firebase.json` :
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 🔄 Processus complet de déploiement

```bash
# 1. S'assurer que le backend VPS fonctionne
curl http://72.61.108.21:3000/health

# 2. Dans le dossier frontend
cd frontend

# 3. Build production
npm run build

# 4. Test local (optionnel)
firebase serve

# 5. Déploiement
firebase deploy

# 6. Ouvrir l'URL
firebase open hosting:site
```

## 🐛 Résolution des problèmes

### Erreur de build

Si vous avez l'erreur `vue-tsc`, utilisez :
```bash
npm run build
```

Au lieu de `npm run build:check` (qui inclut la vérification TypeScript).

### CORS Errors

Si vous avez des erreurs CORS depuis Firebase :

1. **Sur le VPS**, modifiez `.env` :
```env
CORS_ORIGIN=https://nydalgo.web.app,https://nydalgo.firebaseapp.com
```

2. Redémarrez le backend :
```bash
pm2 restart btc-dashboard-api
```

### Le frontend ne charge pas les données

Vérifiez :
1. Backend accessible : `curl http://72.61.108.21:3000/health`
2. CORS configuré
3. `.env.production` correct
4. Build refait après modification

## 📊 Workflow de développement

### Développement local

```bash
# Frontend (utilise .env)
cd frontend
npm run dev

# Backend local
cd backend
npm run dev
```

### Production

```bash
# Backend sur VPS
ssh root@72.61.108.21
cd ~/nydalgo/nydalgo/backend
npm run start:pm2

# Frontend sur Firebase
cd frontend
npm run build
firebase deploy
```

## 🔐 Variables d'environnement

### Local (.env)
```env
VITE_API_URL=http://localhost:3000
```

### Production (.env.production)
```env
VITE_API_URL=http://72.61.108.21:3000
```

## 📈 Surveillance

### Backend (VPS)
```bash
pm2 logs btc-dashboard-api
pm2 monit
```

### Frontend (Firebase)
```bash
firebase hosting:channel:list
firebase hosting:channel:deploy preview
```

## 🎯 Commandes utiles

```bash
# Build sans vérif TypeScript
npm run build

# Build avec vérif TypeScript
npm run build:check

# Preview local du build
npm run preview

# Deploy sur Firebase
firebase deploy

# Deploy seulement hosting
firebase deploy --only hosting

# Test local avant deploy
firebase serve
```

## 🌐 URLs de test

Après déploiement, testez :

```bash
# Health check backend
curl http://72.61.108.21:3000/health

# Frontend Firebase
open https://nydalgo.web.app

# Test API depuis le frontend
# Ouvrez la console navigateur sur votre site Firebase
# et tapez :
fetch('http://72.61.108.21:3000/health').then(r => r.json()).then(console.log)
```

## ✨ Optimisations futures

1. **CDN** : Firebase Hosting utilise déjà un CDN global
2. **Caching** : Configuré automatiquement par Firebase
3. **Compression** : Gzip/Brotli activé par défaut
4. **HTTPS** : Certificat SSL gratuit automatique

## 🔄 Mise à jour rapide

Pour mettre à jour le frontend :
```bash
cd frontend
git pull
npm run build
firebase deploy
```

## 📝 Checklist avant déploiement

- [ ] Backend VPS accessible
- [ ] `.env.production` configuré
- [ ] `npm run build` fonctionne
- [ ] Port 3000 ouvert sur VPS
- [ ] CORS configuré sur backend
- [ ] Firebase project lié

---

**Frontend prêt à déployer sur Firebase ! 🚀**
