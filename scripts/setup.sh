#!/bin/bash

# Script d'initialisation du projet FaviSend

# Vérification de l'existence du dossier uploads
if [ ! -d "uploads" ]; then
  echo "📁 Création du dossier uploads..."
  mkdir -p uploads
fi

# Vérification des permissions
echo "🔒 Configuration des permissions du dossier uploads..."
chmod 755 uploads

# Vérification du fichier .env
if [ ! -f ".env" ]; then
  echo "⚠️ Le fichier .env n'existe pas. Création à partir de .env.example..."
  cp .env.example .env
  echo "✅ Fichier .env créé. Veuillez le modifier avec vos propres valeurs."
fi

echo "🚀 Configuration initiale terminée avec succès!"
echo "💡 N'oubliez pas de :"
echo "  1. Configurer vos variables d'environnement dans .env"
echo "  2. Configurer votre projet Firebase"
echo "  3. Exécuter 'npm install' pour installer les dépendances"
