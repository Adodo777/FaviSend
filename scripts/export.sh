#!/bin/bash

# Script pour exporter le projet FaviSend

# Définir le nom de l'archive
ARCHIVE_NAME="favisend-$(date +"%Y%m%d").tar.gz"

# Vérifier l'existence des dossiers requis
if [ ! -d "uploads" ]; then
  echo "❌ Dossier uploads manquant. Création..."
  mkdir -p uploads
  touch uploads/.gitkeep
fi

echo "🔍 Vérification des fichiers de configuration..."

# Vérifier l'existence du fichier .env.example
if [ ! -f ".env.example" ]; then
  echo "❌ Fichier .env.example manquant."
  exit 1
fi

# Nettoyer les fichiers temporaires et les builds précédents
echo "🧹 Nettoyage des fichiers temporaires..."
rm -rf dist
rm -rf node_modules/.cache
rm -rf *.tar.gz

# Créer l'archive (exclure node_modules, .env, et les fichiers dans uploads/)
echo "📦 Création de l'archive ${ARCHIVE_NAME}..."
tar --exclude='./node_modules' \
    --exclude='./.env' \
    --exclude='./uploads/*' \
    --exclude='!./uploads/.gitkeep' \
    --exclude='./.git' \
    --exclude='./dist' \
    -czvf "${ARCHIVE_NAME}" .

echo "✅ Export terminé avec succès!"
echo "📋 Archive créée: ${ARCHIVE_NAME}"
echo "📏 Taille de l'archive: $(du -h "${ARCHIVE_NAME}" | cut -f1)"
echo ""
echo "📝 Instructions:"
echo "1. Transférez cette archive sur votre machine locale"
echo "2. Décompressez avec: tar -xzvf ${ARCHIVE_NAME}"
echo "3. Suivez les instructions du README.md pour l'installation"
