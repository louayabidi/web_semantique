# Backend Python - API Nutrition & Bien-être

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Configuration

Copiez les variables d'environnement depuis le fichier `.env` principal vers `backend/.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Démarrage

```bash
python main.py
```

Le serveur démarrera sur `http://localhost:8000`

## Endpoints

- `GET /` - Page d'accueil de l'API
- `GET /ontology` - Récupérer l'ontologie OWL en format Turtle
- `POST /search/semantic` - Recherche sémantique
- `GET /aliments` - Liste tous les aliments
- `GET /activites` - Liste toutes les activités
- `POST /recommendations/{personne_id}` - Générer des recommandations
- `POST /sparql` - Exécuter une requête SPARQL personnalisée

## Architecture

- **FastAPI**: Framework web Python moderne
- **RDFLib**: Manipulation d'ontologies OWL et requêtes SPARQL
- **Supabase**: Base de données PostgreSQL
- **Ontology.py**: Définition de l'ontologie du domaine nutrition
