#!/bin/bash

# Script de démarrage rapide pour VPS
# Usage: bash start-vps.sh

echo "🚀 Démarrage du Bitcoin Dashboard API..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "Installez Node.js 18+ : curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    exit 1
fi

# Vérifier PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installation de PM2..."
    sudo npm install -g pm2
fi

# Créer le dossier logs
mkdir -p logs

# Copier le fichier de config production si nécessaire
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.production .env
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Démarrer avec PM2
echo "🚀 Démarrage de l'API avec PM2..."
pm2 start ecosystem.config.js --env production

# Sauvegarder la config PM2
pm2 save

# Afficher le statut
pm2 status

echo ""
echo "✅ Backend démarré avec succès !"
echo "📡 API disponible sur : http://0.0.0.0:3000"
echo "🔍 Testez : curl http://localhost:3000/health"
echo ""
echo "📊 Commandes utiles :"
echo "  - Voir les logs : pm2 logs btc-dashboard-api"
echo "  - Arrêter : pm2 stop btc-dashboard-api"
echo "  - Redémarrer : pm2 restart btc-dashboard-api"
echo ""
