#!/bin/bash

echo "Installation du système de recommandation nutritionnel..."

# Créer les répertoires
mkdir -p backend
mkdir -p app/components/ui

# Installer les dépendances Python
pip install -r backend/requirements.txt

# Installer les dépendances Node
npm install

# Lancer Docker Compose
docker-compose up -d

echo "Système lancé! Accédez à:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:5000"
echo "- Fuseki: http://localhost:3030"
