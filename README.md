# NutriSmart - Système de Recommandation Nutritionnelle Intelligent

Application web full-stack basée sur une ontologie OWL pour recommander des aliments et activités physiques selon les besoins individuels et la santé.

## Caractéristiques

### Fonctionnalités Principales

- **Authentification complète** : Inscription, connexion, gestion de session
- **Gestion des rôles** : Utilisateurs standard et administrateurs
- **Backoffice (Admin)** : CRUD complet pour gérer :
  - Aliments (calories, index glycémique, fibres)
  - Activités physiques (type, durée, niveau, calories)
  - Nutriments (vitamines, minéraux, protéines, glucides, lipides)
  - Conditions médicales (diabète, hypertension, obésité)
  - Programmes de bien-être
- **Frontoffice (Utilisateurs)** :
  - Visualisation des aliments et activités
  - Dashboard personnel avec statistiques
  - Recommandations personnalisées
- **Recherche Sémantique** : Questions en langage naturel
  - "Quels aliments pour le diabète ?"
  - "Aliments riches en fibres"
  - "Activités cardio disponibles"
- **Base de données relationnelle** : PostgreSQL via Supabase
- **Sécurité RLS** : Row Level Security sur toutes les tables

## Architecture

### Stack Technique

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth)
- **Base de données** : PostgreSQL avec RLS
- **Icônes** : Lucide React

### Structure de la Base de Données

L'ontologie OWL a été transformée en schéma relationnel PostgreSQL :

#### Tables Principales
- `personnes` : Utilisateurs avec profils santé
- `aliments` : Catalogue d'aliments avec propriétés nutritionnelles
- `nutriments` : Vitamines, minéraux, macronutriments
- `activites_physiques` : Exercices et activités
- `conditions_medicales` : Diabète, hypertension, obésité, etc.
- `allergies` : Allergies alimentaires
- `preferences_alimentaires` : Végétarien, sans gluten, etc.
- `programmes_bien_etre` : Programmes personnalisés
- `objectifs` : Objectifs de bien-être
- `recommandations` : Recommandations générées

#### Tables de Relations
- Relations many-to-many entre entités
- Historique des consommations et pratiques
- Liens aliments-nutriments
- Aliments recommandés/contre-indiqués par condition

## Utilisation

### Connexion

1. **Créer un compte** : Utilisez l'onglet "Inscription"
2. **Se connecter** : Email + mot de passe

### Compte Admin de Test

```
Email: admin@nutrismart.com
Mot de passe: admin123
```

### Navigation

#### Accueil
- Vue d'ensemble des statistiques
- Recommandations personnalisées
- Accès rapide aux fonctionnalités

#### Recherche Sémantique
- Posez des questions en langage naturel
- Exemples de requêtes fournis
- Résultats filtrés et pertinents

#### Administration (Admin uniquement)
- **Aliments** : CRUD complet avec calories, index glycémique
- **Activités** : Gestion des exercices physiques
- **Nutriments** : Consultation des nutriments
- **Conditions** : Liste des conditions médicales
- **Programmes** : Programmes de bien-être

### Recherche Sémantique

La recherche comprend le langage naturel et effectue des requêtes intelligentes :

- **Diabète** : Trouve aliments recommandés et contre-indiqués
- **Fibres** : Trouve tous les aliments riches en fibres
- **Fruits/Légumes** : Filtre par groupe alimentaire
- **Cardio** : Trouve activités cardiovasculaires
- **Perte de poids** : Trouve programmes et objectifs

## Base de Données

### Données Pré-chargées

L'application contient déjà :
- 14 aliments avec propriétés nutritionnelles
- 14 activités physiques variées
- 10 nutriments essentiels
- 10 conditions médicales
- 10 allergies courantes
- 3 préférences alimentaires
- 10 programmes de bien-être
- 10 objectifs de santé

### Sécurité (RLS)

Toutes les tables sont protégées par Row Level Security :
- Les utilisateurs voient uniquement leurs données personnelles
- Les admins ont accès complet
- Les données publiques (aliments, activités) sont en lecture seule pour tous

## Développement

### Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Vérification TypeScript
npm run typecheck

# Linter
npm run lint
```

### Variables d'Environnement

Configurées dans `.env` :
```
VITE_SUPABASE_URL=<votre-url>
VITE_SUPABASE_ANON_KEY=<votre-clé>
```

## Ontologie OWL Implémentée

### Classes Principales
- ActivitéPhysique (Cardio, Musculation, Yoga, Fitness)
- Aliment
- Nutriment (Vitamine, Minéral, Protéine, Glucide, Lipide)
- ConditionMédicale (Diabète, Hypertension, Obésité, Grossesse)
- Allergie
- PréférenceAlimentaire (Végétarien, Sans Gluten, Sans Lactose)
- ProgrammeBienEtre
- Objectif
- Recommandation

### Propriétés d'Objets
- consomme, pratique, aCondition, aAllergie, aPréférence
- contient, estRecommandéPour, estContreIndiquéPour
- Vise, Nécessite, Conseille

### Propriétés de Données
- Calories, index_glycemique, riche_en_fibres
- duree_activite, niveau_difficulte, calories_brulees
- dose_recommandee, unite_dose
- age, poids, taille, genre

## Fonctionnalités Futures

- Génération automatique de recommandations IA
- Graphiques et statistiques avancées
- Export PDF des programmes
- Intégration calendrier
- Application mobile
- API REST publique
- Notifications push

## Licence

Projet éducatif - Web Sémantique
