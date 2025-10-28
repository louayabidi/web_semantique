# Plateforme de Recommandations Nutritionnelles Sémantiques

Application full-stack de recommandation nutritionnelle basée sur une ontologie OWL avec recherche sémantique SPARQL et traduction langage naturel.

## 🚀 Stack Technique

- **Backend**: Python FastAPI
- **Frontend**: React (Vite)
- **Base de données**: PostgreSQL
- **Ontologie**: OWL/RDF avec RDFLib
- **Recherche sémantique**: SPARQL (in-memory avec RDFLib)
- **Authentification**: JWT avec rôles (admin/user)

## 📋 Fonctionnalités

### ✅ Backend
- ✅ Authentification JWT avec rôles admin et user
- ✅ CRUD automatique pour les entités de l'ontologie (Aliment, Recette, Nutriment, etc.)
- ✅ Endpoint `/api/semantic/sparql` pour requêtes SPARQL brutes
- ✅ Endpoint `/api/semantic/nl-search` pour requêtes en langage naturel
- ✅ Synchronisation PostgreSQL ↔ RDF Graph
- ✅ Modèles SQLAlchemy pour: Aliment, Recette, Nutriment, GroupeAlimentaire, Allergie, Objectif, Personne

### ✅ Frontend
- ✅ Interface publique (frontoffice) : catalogue, recettes, recherche sémantique
- ✅ Interface admin (backoffice) : gestion CRUD des entités
- ✅ Authentification avec gestion des rôles
- ✅ Filtrage avancé par catégorie, nutriments, recherche texte
- ✅ Interface de recherche sémantique (NL + SPARQL)

## 🏗️ Architecture du Projet

\`\`\`
.
├── backend/
│   ├── app/
│   │   ├── api/              # Routes API
│   │   │   ├── auth.py       # Authentification
│   │   │   ├── aliments.py   # CRUD Aliments
│   │   │   ├── recettes.py   # CRUD Recettes
│   │   │   ├── sparql.py     # Recherche sémantique
│   │   │   └── crud_entities.py  # Autres entités
│   │   ├── core/             # Configuration
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py   # JWT, hashing
│   │   ├── models/           # Modèles SQLAlchemy
│   │   │   ├── user.py
│   │   │   └── nutrition.py
│   │   ├── schemas/          # Schémas Pydantic
│   │   │   ├── user.py
│   │   │   └── nutrition.py
│   │   └── services/         # Services métier
│   │       ├── ontology_loader.py   # Chargement OWL
│   │       └── sparql_service.py    # SPARQL queries
│   ├── ontology/
│   │   └── nutrition.owl     # Ontologie OWL
│   ├── main.py              # Point d'entrée FastAPI
│   ├── init_db.py           # Initialisation DB
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   │   └── Navbar.jsx
│   │   ├── contexts/        # Contextes React
│   │   │   └── AuthContext.jsx
│   │   ├── pages/           # Pages de l'application
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Catalog.jsx  # Frontoffice
│   │   │   ├── Recettes.jsx # Frontoffice
│   │   │   ├── Search.jsx   # Recherche sémantique
│   │   │   └── Admin.jsx    # Backoffice
│   │   ├── services/
│   │   │   └── api.js       # Appels API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── docker-compose.yml
\`\`\`

## 🚀 Installation et Démarrage

### Option 1: Avec Docker Compose (Recommandé)

\`\`\`bash
# Lancer tous les services
docker-compose up -d

# Les services seront disponibles sur:
# - Frontend: http://localhost:5000
# - Backend API: http://localhost:8000
# - Docs API: http://localhost:8000/docs
\`\`\`

### Option 2: Installation manuelle (Développement Replit)

#### 1. Backend

\`\`\`bash
cd backend

# Initialiser la base de données
python init_db.py

# Démarrer le serveur FastAPI
python main.py
# Ou avec uvicorn:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`

Le backend sera disponible sur: http://localhost:8000

#### 2. Frontend

\`\`\`bash
cd frontend

# Démarrer le serveur de développement
npm run dev
\`\`\`

Le frontend sera disponible sur: http://localhost:5000

## 🔐 Authentification

### Compte Admin par défaut

- **Username**: \`admin\`
- **Password**: \`admin123\`

### Créer un nouveau compte

Utilisez la page d'inscription ou l'endpoint API:

\`\`\`bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "email": "user1@example.com",
    "password": "password123",
    "is_admin": false
  }'
\`\`\`

## 🔍 Exemples de Recherche Sémantique

### 5 Exemples de Requêtes Langage Naturel → SPARQL

#### Exemple 1: Aliments par catégorie

**Question NL**: "Quels sont les produits de la catégorie Fruits ?"

**SPARQL généré**:
\`\`\`sparql
PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?aliment ?groupe
WHERE {
    ?aliment rdf:type nutrition:Aliment .
    ?aliment nutrition:appartientÀGroupe ?groupe .
    ?groupe rdf:type nutrition:GroupeAlimentaire .
}
\`\`\`

#### Exemple 2: Recettes pour diabétiques

**Question NL**: "Quelles recettes pour les diabétiques ?"

**SPARQL généré**:
\`\`\`sparql
PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT ?recette ?aliment
WHERE {
    ?recette rdf:type nutrition:Recette .
    ?recette nutrition:estComposéDe ?aliment .
    ?aliment nutrition:estRecommandéPour ?condition .
    ?condition rdf:type nutrition:Diabète .
}
\`\`\`

#### Exemple 3: Nutriments dans les aliments

**Question NL**: "Quels aliments contiennent des vitamines ?"

**SPARQL généré**:
\`\`\`sparql
PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT ?aliment ?nutriment
WHERE {
    ?aliment rdf:type nutrition:Aliment .
    ?aliment nutrition:contient ?nutriment .
    ?nutriment rdf:type nutrition:Nutriment .
}
\`\`\`

#### Exemple 4: Liste des allergies

**Question NL**: "Quelles sont les allergies connues ?"

**SPARQL généré**:
\`\`\`sparql
PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT ?allergie ?type
WHERE {
    ?allergie rdf:type nutrition:Allergie .
    OPTIONAL { ?allergie nutrition:typeAllergie ?type . }
}
\`\`\`

#### Exemple 5: Objectifs de santé

**Question NL**: "Quels sont les objectifs disponibles ?"

**SPARQL généré**:
\`\`\`sparql
PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT ?objectif ?description
WHERE {
    ?objectif rdf:type nutrition:Objectif .
    OPTIONAL { ?objectif nutrition:objectifBienEtre ?description . }
}
\`\`\`

## 📡 Tester les Endpoints API

### 1. Authentification

\`\`\`bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
\`\`\`

### 2. Récupérer les aliments

\`\`\`bash
curl http://localhost:8000/api/aliments
\`\`\`

### 3. Recherche SPARQL brute

\`\`\`bash
curl -X POST http://localhost:8000/api/semantic/sparql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?class WHERE { ?class rdf:type <http://www.w3.org/2002/07/owl#Class> } LIMIT 20"
  }'
\`\`\`

### 4. Recherche en langage naturel

\`\`\`bash
curl -X POST http://localhost:8000/api/semantic/nl-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Quels sont les aliments riches en protéines ?"}'
\`\`\`

### 5. Créer un aliment (Admin uniquement)

\`\`\`bash
curl -X POST http://localhost:8000/api/aliments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nom": "Poulet grillé",
    "calories": 165,
    "description": "Viande blanche riche en protéines",
    "groupe_id": 3,
    "nutriment_ids": [1]
  }'
\`\`\`

## 🎯 Utilisation de l'Interface Web

### Frontoffice (Accessible à tous)

1. **Page d'accueil** (`/`): Présentation des fonctionnalités
2. **Catalogue** (`/catalog`): Parcourir tous les aliments avec filtres
3. **Recettes** (`/recettes`): Explorer les recettes disponibles
4. **Recherche Sémantique** (`/search`): Interroger l'ontologie en NL ou SPARQL

### Backoffice (Réservé aux admins)

1. Connectez-vous avec le compte admin
2. Accédez à la page **Admin** (`/admin`)
3. Créez, modifiez ou supprimez des aliments et recettes
4. Les modifications sont automatiquement synchronisées avec le graphe RDF

## 🗄️ Base de Données

### Modèles Principaux

- **User**: Utilisateurs et admins
- **Aliment**: Produits alimentaires
- **Recette**: Recettes culinaires
- **Nutriment**: Vitamines, minéraux, macronutriments
- **GroupeAlimentaire**: Catégories (Fruits, Légumes, etc.)
- **Allergie**: Allergies et intolérances
- **Objectif**: Objectifs de santé et bien-être
- **Personne**: Profils utilisateurs avec conditions médicales

### Charger l'Ontologie

L'ontologie OWL est chargée automatiquement au démarrage du backend depuis `backend/ontology/nutrition.owl`.

Pour recharger manuellement:

\`\`\`python
from app.services.ontology_loader import ontology_loader
ontology_loader.load_ontology()
\`\`\`

## 🔧 Configuration

### Variables d'environnement (Backend)

\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/nutrition_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
\`\`\`

## 📚 Documentation API

La documentation interactive est disponible sur:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🚀 Prochaines Étapes (Phase 2)

- [ ] Intégration Apache Jena Fuseki pour triplestore scalable
- [ ] NL→SPARQL avancé avec IA (GPT/Claude)
- [ ] Moteur de recommandations personnalisées
- [ ] Système de suggestions de recettes basé sur profil
- [ ] Filtrage multi-critères avancé (saison, score nutritionnel)
- [ ] Export PDF des recommandations
- [ ] Tableau de bord analytics
- [ ] Application mobile (PWA)

## 🤝 Contribution

Ce projet est un MVP de plateforme de recommandations nutritionnelles sémantiques. Les contributions sont les bienvenues!

## 📄 Licence

MIT License
