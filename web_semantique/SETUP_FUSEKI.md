# Configuration Fuseki Locale

## Option 1: Utiliser Fuseki Standalone (Recommandé)

### 1. Télécharger Fuseki
\`\`\`bash
# Télécharger depuis https://jena.apache.org/download/index.cgi
# Ou utiliser wget/curl
wget https://archive.apache.org/dist/jena/binaries/apache-jena-fuseki-4.10.0.tar.gz
tar -xzf apache-jena-fuseki-4.10.0.tar.gz
cd apache-jena-fuseki-4.10.0
\`\`\`

### 2. Démarrer Fuseki
\`\`\`bash
./fuseki-server --mem /nutrition
\`\`\`

Fuseki sera accessible sur: http://localhost:3030

### 3. Désactiver l'authentification (Optionnel)
Si vous voulez désactiver l'authentification:
- Éditer `run/config.ttl`
- Commenter ou supprimer les lignes d'authentification
- Redémarrer Fuseki

### 4. Créer le dataset
- Aller sur http://localhost:3030
- Cliquer sur "Manage datasets"
- Créer un nouveau dataset nommé "nutrition"
- Sélectionner "Persistent" ou "In-memory"

## Option 2: Utiliser Docker (Alternative)

\`\`\`bash
docker run -d -p 3030:3030 --name fuseki stain/jena-fuseki:latest
\`\`\`

## Option 3: Utiliser Docker Compose

\`\`\`yaml
version: '3.8'
services:
  fuseki:
    image: stain/jena-fuseki:latest
    ports:
      - "3030:3030"
    environment:
      - ADMIN_PASSWORD=admin
    volumes:
      - fuseki-data:/fuseki
volumes:
  fuseki-data:
\`\`\`

## Vérifier la connexion

\`\`\`bash
curl http://localhost:3030/$/ping
\`\`\`

## Charger les données RDF

Une fois Fuseki démarré, vous pouvez charger les données via:

1. **Interface Web**: http://localhost:3030/#/manage
2. **API REST**:
\`\`\`bash
curl -X POST http://localhost:3030/nutrition/data \
  -H "Content-Type: application/rdf+xml" \
  -d @data.rdf
\`\`\`

3. **SPARQL Update**:
\`\`\`bash
curl -X POST http://localhost:3030/nutrition/update \
  -d "update=INSERT DATA { ... }"
\`\`\`

## Credentials par défaut

- Nom d'utilisateur: `admin`
- Mot de passe: `admin`

## Troubleshooting

### Erreur: "Connection refused"
- Vérifier que Fuseki est démarré: `curl http://localhost:3030/$/ping`
- Vérifier le port: `netstat -an | grep 3030`

### Erreur: "Unauthorized"
- Vérifier les credentials dans `.env`
- Vérifier que l'authentification est activée dans Fuseki

### Dataset non trouvé
- Créer le dataset via l'interface web
- Ou utiliser l'API: `curl -X POST http://localhost:3030/$/datasets?dbName=nutrition&dbType=mem`
