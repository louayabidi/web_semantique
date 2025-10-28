# Guide d'Utilisation - NutriSmart

## Démarrage Rapide

### 1. Premier Lancement

L'application est maintenant disponible dans votre preview. Vous verrez la page de connexion.

### 2. Options de Connexion

#### Option A : Créer un nouveau compte
1. Cliquez sur l'onglet "Inscription"
2. Remplissez :
   - Nom complet
   - Email
   - Mot de passe (minimum 6 caractères)
3. Cliquez sur "S'inscrire"
4. Vous serez automatiquement connecté

#### Option B : Utiliser le compte admin de test
```
Email: admin@nutrismart.com
Mot de passe: admin123
```
Note : Ce compte vous donnera accès à l'interface d'administration

## Navigation dans l'Application

### Page d'Accueil
Après connexion, vous arrivez sur le dashboard avec :
- **Statistiques** : Nombre d'aliments, activités, programmes
- **Recommandations personnalisées** (quand vous aurez complété votre profil)
- **Accès rapide** aux fonctionnalités principales

### Recherche Sémantique
Cliquez sur "Recherche" dans le menu pour :
1. **Poser des questions en langage naturel**
   - "Quels aliments pour le diabète ?"
   - "Aliments riches en fibres"
   - "Activités cardio"
   - "Programme perte de poids"

2. **Utiliser les exemples fournis**
   - Cliquez sur les boutons d'exemples pour tester

3. **Voir les résultats organisés**
   - Aliments avec calories et propriétés
   - Activités avec niveau et durée
   - Programmes avec objectifs

### Administration (Admin uniquement)
Si vous êtes connecté en tant qu'admin, vous verrez l'onglet "Administration" :

#### Gestion des Aliments
- **Voir** : Liste complète avec calories, index glycémique
- **Ajouter** : Bouton "Ajouter un aliment"
  - Nom, calories, index glycémique
  - Riche en fibres (oui/non)
  - Description
- **Modifier** : Cliquez sur l'icône crayon
- **Supprimer** : Cliquez sur l'icône corbeille

#### Gestion des Activités
- **Voir** : Liste des exercices
- **Ajouter** : Formulaire complet
  - Nom, type (Cardio, Yoga, etc.)
  - Durée en minutes
  - Niveau (Facile, Moyen, Difficile)
  - Calories brûlées
  - Description
- **Modifier/Supprimer** : Comme pour les aliments

#### Consulter les Autres Données
- **Nutriments** : Liste des vitamines, minéraux, etc.
- **Conditions Médicales** : Diabète, hypertension, etc.
- **Programmes** : Programmes de bien-être avec objectifs

## Exemples de Recherches

### Recherche par Condition Médicale
Tapez : "diabète" ou "aliments pour diabète"
→ Vous verrez :
- Aliments recommandés (Brocoli, Lentilles)
- Aliments à éviter (Soda, Pain blanc)

### Recherche par Nutriment
Tapez : "fibres" ou "aliments riches en fibres"
→ Liste des aliments avec fibres (Pomme, Lentilles, Flocons d'avoine)

### Recherche par Type d'Aliment
Tapez : "fruits" ou "légumes"
→ Liste filtrée par groupe alimentaire

### Recherche d'Activités
Tapez : "cardio" ou "course"
→ Toutes les activités cardiovasculaires

## Base de Données Pré-chargée

L'application contient déjà :

### Aliments (14)
- Pomme, Banane, Poulet Grillé, Saumon
- Riz Complet, Brocoli, Oeuf, Lait
- Pain Complet, Amandes, Lentilles, Flocons d'Avoine
- Soda, Pain Blanc (à éviter pour certaines conditions)

### Activités (14)
- Course à Pied, Natation, Vélo, Marche Rapide
- Escalade, Aérobic, Zumba, Pilates
- Tai Chi, Randonnée, Yoga, Musculation, Fitness

### Nutriments (10)
- Vitamine C, Vitamine D, Calcium, Fer, Magnésium, Zinc
- Protéines, Glucides Complexes, Oméga-3, Fibres

### Conditions Médicales (10)
- Diabète Type 1 & 2, Hypertension, Obésité (légère, modérée, sévère)
- Grossesse (3 trimestres)

### Programmes (10)
- Perte de poids, Masse musculaire, Détox, Énergie
- Sportif, Sénior, Fitness, Végétarien, Équilibré

## Fonctionnalités CRUD

### Backoffice (Admin)
Les admins peuvent :
- ✅ **Create** : Ajouter de nouveaux aliments et activités
- ✅ **Read** : Consulter toutes les données
- ✅ **Update** : Modifier les entrées existantes
- ✅ **Delete** : Supprimer des entrées

### Frontoffice (Utilisateurs)
Les utilisateurs peuvent :
- ✅ Voir tous les aliments et activités
- ✅ Effectuer des recherches sémantiques
- ✅ Voir leurs recommandations personnalisées
- ✅ Gérer leur profil (section en développement)

## Sécurité

### Authentification
- Email/mot de passe sécurisés via Supabase Auth
- Session persistante
- Déconnexion sécurisée

### Autorisations (RLS)
- Les données personnelles sont privées
- Les données publiques (aliments, activités) sont en lecture seule
- Les admins ont accès complet au backoffice
- Protection au niveau de la base de données

## Architecture Technique

### Technologies Utilisées
- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS (design moderne et responsive)
- **Backend** : Supabase (PostgreSQL + Authentication)
- **Base de données** : PostgreSQL avec Row Level Security
- **Icônes** : Lucide React

### Schéma Ontologique
L'application implémente l'ontologie OWL fournie avec :
- 32+ classes (Aliment, Activité, Nutriment, Condition, etc.)
- Relations objets (consomme, pratique, contient, recommandé pour)
- Propriétés de données (calories, durée, dose, âge, poids)
- Hiérarchies de classes (Diabète ⊂ Condition, Cardio ⊂ Activité)

## Prochaines Étapes

### Fonctionnalités à Développer
1. **Profil Utilisateur Complet**
   - Ajouter âge, poids, taille
   - Sélectionner conditions médicales
   - Définir allergies et préférences
   - Choisir objectifs

2. **Recommandations Automatiques**
   - Basées sur le profil
   - Utilisant les relations ontologiques
   - Évitant les contre-indications

3. **Tableaux de Bord Avancés**
   - Graphiques de suivi
   - Historique des consommations
   - Progression vers objectifs

4. **Filtres Avancés**
   - Par catégorie, calories, IG
   - Par type d'activité, niveau
   - Combinaisons multiples

## Support

### Questions Fréquentes

**Q : Comment devenir administrateur ?**
R : Utilisez le compte admin de test ou modifiez le rôle dans la base de données.

**Q : Puis-je ajouter mes propres aliments ?**
R : Oui, si vous êtes admin. Sinon, contactez un administrateur.

**Q : La recherche ne trouve rien**
R : Essayez des mots-clés différents ou consultez les exemples fournis.

**Q : Mes données sont-elles privées ?**
R : Oui, grâce au Row Level Security. Seul vous (et les admins) pouvez voir vos données personnelles.

### Structure du Projet

```
src/
├── components/
│   ├── Admin/           # Composants CRUD backoffice
│   ├── Auth/            # Login/Inscription
│   └── Layout/          # Navigation
├── contexts/
│   └── AuthContext.tsx  # Gestion authentification
├── lib/
│   └── supabase.ts      # Client Supabase
├── pages/
│   ├── HomePage.tsx     # Dashboard principal
│   ├── SearchPage.tsx   # Recherche sémantique
│   └── AdminPage.tsx    # Interface admin
└── App.tsx              # Point d'entrée
```

## Bon à Savoir

- L'application est **responsive** (mobile, tablette, desktop)
- Le **design est moderne** avec Tailwind CSS
- Les **performances sont optimisées** avec React + Vite
- La **sécurité est maximale** avec Supabase RLS
- Le **code est propre** et bien organisé en composants

Profitez de NutriSmart ! 🍎💚
