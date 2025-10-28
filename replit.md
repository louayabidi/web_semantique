# Projet: Plateforme de Recommandations Nutritionnelles Sémantiques

## Vue d'ensemble
Application full-stack de recommandation nutritionnelle basée sur une ontologie OWL avec recherche sémantique SPARQL et traduction en langage naturel.

## État actuel
✅ **MVP FONCTIONNEL ET TESTÉ** - Toutes les fonctionnalités principales sont implémentées, testées et validées

## Architecture
- **Backend**: FastAPI (Python) sur port 8000
- **Frontend**: React + Vite sur port 5000
- **Base de données**: PostgreSQL (Replit managed)
- **Ontologie**: OWL/RDF avec RDFLib (in-memory SPARQL)

## Fonctionnalités implémentées

### Backend
- ✅ Authentification JWT avec rôles (admin/user)
- ✅ CRUD pour Aliments, Recettes, Nutriments, Groupes alimentaires, Allergies, Objectifs
- ✅ Endpoint SPARQL brut (`/api/semantic/sparql`)
- ✅ Endpoint recherche NL→SPARQL (`/api/semantic/nl-search`)
- ✅ Synchronisation PostgreSQL ↔ RDF Graph
- ✅ Auto-génération CRUD basée sur l'ontologie OWL

### Frontend
- ✅ Interface publique (frontoffice): Catalogue, Recettes, Recherche sémantique
- ✅ Interface admin (backoffice): Gestion CRUD complète
- ✅ Authentification avec détection de rôle
- ✅ Filtrage par catégorie, recherche texte
- ✅ Interface de recherche sémantique (NL + SPARQL)

## Modifications récentes (2025-10-28)
- ✅ MVP complet avec backend FastAPI et frontend React
- ✅ Sécurité: Registration forcée à is_admin=False (pas d'escalade de privilèges)
- ✅ Base de données seed: 17 aliments, 6 groupes, 7 nutriments, 3 recettes, 4 allergies, 4 objectifs
- ✅ Ontologie fallback avec sync PostgreSQL→RDF (804 triples)
- ✅ SPARQL queries testées et fonctionnelles (retourne 17 résultats réels)
- ✅ NL→SPARQL testé: "Quels sont les aliments disponibles?" → 17 paires aliment-groupe
- ✅ Authentification JWT avec rôles (admin/user)
- ✅ Backend port 8000, Frontend port 5000

## Fichiers importants
- `backend/main.py`: Point d'entrée FastAPI
- `backend/app/services/ontology_loader.py`: Chargement OWL
- `backend/app/services/sparql_service.py`: Service SPARQL et NL→SPARQL
- `frontend/src/App.jsx`: Application React principale
- `backend/ontology/nutrition.owl`: Ontologie nutritionnelle
- `README.md`: Documentation complète

## Compte admin
- Username: `admin`
- Password: `admin123`

## Endpoints API principaux
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/aliments` - Liste des aliments
- `GET /api/recettes` - Liste des recettes
- `POST /api/semantic/sparql` - Requête SPARQL brute
- `POST /api/semantic/nl-search` - Recherche langage naturel
- `GET /docs` - Documentation Swagger

## Tests effectués
- ✅ REST API: GET /api/aliments retourne 17 aliments avec détails
- ✅ SPARQL direct: Requête pour lister aliments → retourne Pomme, Banane, Orange, etc.
- ✅ NL→SPARQL: "Quels sont les aliments disponibles?" → 17 résultats avec relations aliment-groupe
- ✅ Authentification: Login admin/user fonctionnel
- ✅ Frontend: Navigation entre pages, affichage catalogue

## Notes techniques
- L'ontologie OWL a une erreur de parsing (ligne 615) - le système utilise un fallback fonctionnel
- Backend utilise bcrypt direct (pas passlib) pour compatibilité
- RDF sync crée des object properties URI (pas des literals) pour compatibilité SPARQL
- Backend: API_PORT=8000, Frontend: PORT=5000

## Prochaines étapes suggérées
- [ ] Corriger l'erreur de parsing OWL (ligne 615)
- [ ] Ajouter triplestore externe (Apache Jena Fuseki)
- [ ] NL→SPARQL avancé avec modèle IA
- [ ] Moteur de recommandations personnalisées
- [ ] Export PDF des recommandations
- [ ] Tests unitaires et d'intégration
