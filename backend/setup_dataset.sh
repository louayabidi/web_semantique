#!/bin/bash

# Script pour créer le dataset Fuseki et charger les données initiales

FUSEKI_URL="http://localhost:3030"
DATASET_NAME="nutrition"
USERNAME="admin"
PASSWORD="admin"

echo "Création du dataset $DATASET_NAME..."

# Créer le dataset
curl -X POST "$FUSEKI_URL/\$/datasets?dbName=$DATASET_NAME&dbType=mem" \
  -u "$USERNAME:$PASSWORD" \
  -H "Content-Type: application/x-www-form-urlencoded"

echo "Dataset créé avec succès!"
echo "Accédez à: $FUSEKI_URL/#/dataset/$DATASET_NAME/query"
