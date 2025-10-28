/*
  # Création du schéma de base de données pour l'ontologie nutritionnelle

  ## Description
  Cette migration crée l'ensemble du schéma de base de données basé sur l'ontologie OWL fournie.
  Le système permet de recommander des aliments et activités selon les besoins individuels et la santé.

  ## Nouvelles Tables

  ### 1. Personnes et Professionnels
  - `personnes` - Utilisateurs du système avec leurs données personnelles
  - `professionnels_sante` - Professionnels de santé qui conseillent les personnes

  ### 2. Aliments et Nutrition
  - `aliments` - Catalogue des aliments avec leurs propriétés nutritionnelles
  - `nutriments` - Vitamines, minéraux, protéines, glucides, lipides
  - `groupes_alimentaires` - Catégorisation des aliments (fruits, légumes, etc.)
  - `recettes` - Recettes composées de plusieurs aliments
  - `repas` - Repas composés d'aliments

  ### 3. Activités et Programmes
  - `activites_physiques` - Catalogue des activités physiques
  - `programmes_bien_etre` - Programmes de bien-être personnalisés
  - `objectifs` - Objectifs de bien-être des utilisateurs

  ### 4. Santé et Préférences
  - `conditions_medicales` - Conditions médicales (diabète, hypertension, etc.)
  - `allergies` - Allergies alimentaires
  - `preferences_alimentaires` - Préférences (végétarien, sans gluten, etc.)
  - `regimes_alimentaires` - Régimes alimentaires personnalisés

  ### 5. Recommandations
  - `recommandations` - Recommandations personnalisées générées

  ### 6. Tables de Relations (Many-to-Many)
  - Relations entre personnes et aliments, activités, conditions, etc.

  ## Sécurité
  - RLS activé sur toutes les tables
  - Politiques restrictives par défaut
  - Accès basé sur l'authentification et les rôles
  - Les utilisateurs peuvent uniquement voir/modifier leurs propres données
  - Les admins ont un accès complet via le backoffice
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types ENUM
CREATE TYPE genre_type AS ENUM ('Homme', 'Femme', 'Autre');
CREATE TYPE role_type AS ENUM ('user', 'admin', 'professionnel');
CREATE TYPE type_nutriment AS ENUM ('Vitamine', 'Minéral', 'Protéine', 'Glucide', 'Lipide');
CREATE TYPE niveau_difficulte AS ENUM ('Facile', 'Moyen', 'Difficile');

-- Table: personnes
CREATE TABLE IF NOT EXISTS personnes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text NOT NULL,
  age integer,
  genre genre_type,
  poids numeric(5,2),
  taille numeric(5,2),
  role role_type DEFAULT 'user',
  niveau_energie integer DEFAULT 5,
  niveau_stress integer DEFAULT 5,
  temps_sommeil numeric(4,2),
  objectif_poids text,
  objectif_bien_etre text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: professionnels_sante
CREATE TABLE IF NOT EXISTS professionnels_sante (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  personne_id uuid REFERENCES personnes(id) ON DELETE CASCADE,
  specialite text NOT NULL,
  numero_ordre text,
  created_at timestamptz DEFAULT now()
);

-- Table: groupes_alimentaires
CREATE TABLE IF NOT EXISTS groupes_alimentaires (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table: aliments
CREATE TABLE IF NOT EXISTS aliments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text UNIQUE NOT NULL,
  calories integer DEFAULT 0,
  index_glycemique integer,
  indice_satiete integer,
  score_nutritionnel integer,
  groupe_alimentaire_id uuid REFERENCES groupes_alimentaires(id),
  riche_en_fibres boolean DEFAULT false,
  index_glycemique_eleve boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: nutriments
CREATE TABLE IF NOT EXISTS nutriments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text UNIQUE NOT NULL,
  type_nutriment type_nutriment NOT NULL,
  dose_recommandee numeric(10,2),
  unite_dose text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table: activites_physiques
CREATE TABLE IF NOT EXISTS activites_physiques (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text UNIQUE NOT NULL,
  type_activite text,
  duree_activite numeric(5,2),
  niveau_difficulte niveau_difficulte,
  frequence_recommandee text,
  calories_brulees integer,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: objectifs
CREATE TABLE IF NOT EXISTS objectifs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text UNIQUE NOT NULL,
  objectif_bien_etre text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table: programmes_bien_etre
CREATE TABLE IF NOT EXISTS programmes_bien_etre (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text UNIQUE NOT NULL,
  objectif_id uuid REFERENCES objectifs(id),
  description text,
  duree_semaines integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: conditions_medicales
CREATE TABLE IF NOT EXISTS conditions_medicales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text UNIQUE NOT NULL,
  type_condition text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table: allergies
CREATE TABLE IF NOT EXISTS allergies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text UNIQUE NOT NULL,
  type_allergie text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table: preferences_alimentaires
CREATE TABLE IF NOT EXISTS preferences_alimentaires (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text UNIQUE NOT NULL,
  type_preference text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table: regimes_alimentaires
CREATE TABLE IF NOT EXISTS regimes_alimentaires (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  personne_id uuid REFERENCES personnes(id) ON DELETE CASCADE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: repas
CREATE TABLE IF NOT EXISTS repas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  type_repas text,
  regime_alimentaire_id uuid REFERENCES regimes_alimentaires(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Table: recettes
CREATE TABLE IF NOT EXISTS recettes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text UNIQUE NOT NULL,
  instructions text,
  temps_preparation integer,
  niveau_difficulte niveau_difficulte,
  created_at timestamptz DEFAULT now()
);

-- Table: recommandations
CREATE TABLE IF NOT EXISTS recommandations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  personne_id uuid REFERENCES personnes(id) ON DELETE CASCADE,
  titre text NOT NULL,
  contenu text NOT NULL,
  type_recommandation text,
  created_at timestamptz DEFAULT now()
);

-- TABLES DE RELATIONS (Many-to-Many)

-- Aliments contiennent des nutriments
CREATE TABLE IF NOT EXISTS aliments_nutriments (
  aliment_id uuid REFERENCES aliments(id) ON DELETE CASCADE,
  nutriment_id uuid REFERENCES nutriments(id) ON DELETE CASCADE,
  quantite numeric(10,2),
  PRIMARY KEY (aliment_id, nutriment_id)
);

-- Personnes consomment des aliments
CREATE TABLE IF NOT EXISTS personnes_aliments (
  personne_id uuid REFERENCES personnes(id) ON DELETE CASCADE,
  aliment_id uuid REFERENCES aliments(id) ON DELETE CASCADE,
  date_consommation timestamptz DEFAULT now(),
  quantite numeric(10,2),
  PRIMARY KEY (personne_id, aliment_id, date_consommation)
);

-- Personnes pratiquent des activités
CREATE TABLE IF NOT EXISTS personnes_activites (
  personne_id uuid REFERENCES personnes(id) ON DELETE CASCADE,
  activite_id uuid REFERENCES activites_physiques(id) ON DELETE CASCADE,
  date_pratique timestamptz DEFAULT now(),
  duree numeric(5,2),
  PRIMARY KEY (personne_id, activite_id, date_pratique)
);

-- Personnes ont des conditions médicales
CREATE TABLE IF NOT EXISTS personnes_conditions (
  personne_id uuid REFERENCES personnes(id) ON DELETE CASCADE,
  condition_id uuid REFERENCES conditions_medicales(id) ON DELETE CASCADE,
  date_diagnostic timestamptz DEFAULT now(),
  PRIMARY KEY (personne_id, condition_id)
);

-- Personnes ont des allergies
CREATE TABLE IF NOT EXISTS personnes_allergies (
  personne_id uuid REFERENCES personnes(id) ON DELETE CASCADE,
  allergie_id uuid REFERENCES allergies(id) ON DELETE CASCADE,
  PRIMARY KEY (personne_id, allergie_id)
);

-- Personnes ont des préférences alimentaires
CREATE TABLE IF NOT EXISTS personnes_preferences (
  personne_id uuid REFERENCES personnes(id) ON DELETE CASCADE,
  preference_id uuid REFERENCES preferences_alimentaires(id) ON DELETE CASCADE,
  PRIMARY KEY (personne_id, preference_id)
);

-- Personnes suivent des programmes
CREATE TABLE IF NOT EXISTS personnes_programmes (
  personne_id uuid REFERENCES personnes(id) ON DELETE CASCADE,
  programme_id uuid REFERENCES programmes_bien_etre(id) ON DELETE CASCADE,
  date_debut timestamptz DEFAULT now(),
  date_fin timestamptz,
  PRIMARY KEY (personne_id, programme_id)
);

-- Aliments recommandés pour conditions
CREATE TABLE IF NOT EXISTS aliments_recommandes_conditions (
  aliment_id uuid REFERENCES aliments(id) ON DELETE CASCADE,
  condition_id uuid REFERENCES conditions_medicales(id) ON DELETE CASCADE,
  PRIMARY KEY (aliment_id, condition_id)
);

-- Aliments contre-indiqués pour conditions
CREATE TABLE IF NOT EXISTS aliments_contre_indiques_conditions (
  aliment_id uuid REFERENCES aliments(id) ON DELETE CASCADE,
  condition_id uuid REFERENCES conditions_medicales(id) ON DELETE CASCADE,
  PRIMARY KEY (aliment_id, condition_id)
);

-- Repas composés d'aliments
CREATE TABLE IF NOT EXISTS repas_aliments (
  repas_id uuid REFERENCES repas(id) ON DELETE CASCADE,
  aliment_id uuid REFERENCES aliments(id) ON DELETE CASCADE,
  quantite numeric(10,2),
  PRIMARY KEY (repas_id, aliment_id)
);

-- Recettes composées d'aliments
CREATE TABLE IF NOT EXISTS recettes_aliments (
  recette_id uuid REFERENCES recettes(id) ON DELETE CASCADE,
  aliment_id uuid REFERENCES aliments(id) ON DELETE CASCADE,
  quantite numeric(10,2),
  unite text,
  PRIMARY KEY (recette_id, aliment_id)
);

-- Programmes incluent des activités
CREATE TABLE IF NOT EXISTS programmes_activites (
  programme_id uuid REFERENCES programmes_bien_etre(id) ON DELETE CASCADE,
  activite_id uuid REFERENCES activites_physiques(id) ON DELETE CASCADE,
  frequence_semaine integer,
  PRIMARY KEY (programme_id, activite_id)
);

-- Professionnels conseillent des personnes
CREATE TABLE IF NOT EXISTS professionnels_personnes (
  professionnel_id uuid REFERENCES professionnels_sante(id) ON DELETE CASCADE,
  personne_id uuid REFERENCES personnes(id) ON DELETE CASCADE,
  date_consultation timestamptz DEFAULT now(),
  PRIMARY KEY (professionnel_id, personne_id, date_consultation)
);

-- INDEXES pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_personnes_user_id ON personnes(user_id);
CREATE INDEX IF NOT EXISTS idx_aliments_nom ON aliments(nom);
CREATE INDEX IF NOT EXISTS idx_activites_nom ON activites_physiques(nom);
CREATE INDEX IF NOT EXISTS idx_nutriments_type ON nutriments(type_nutriment);
CREATE INDEX IF NOT EXISTS idx_recommandations_personne ON recommandations(personne_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE personnes ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionnels_sante ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutriments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activites_physiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes_bien_etre ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions_medicales ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences_alimentaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE regimes_alimentaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE repas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommandations ENABLE ROW LEVEL SECURITY;
ALTER TABLE groupes_alimentaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliments_nutriments ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnes_aliments ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnes_activites ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnes_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnes_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnes_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnes_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliments_recommandes_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliments_contre_indiques_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE repas_aliments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recettes_aliments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes_activites ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionnels_personnes ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Personnes: Les utilisateurs voient leur propre profil, les admins voient tout
CREATE POLICY "Users can view own profile"
  ON personnes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR role = 'admin');

CREATE POLICY "Users can update own profile"
  ON personnes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON personnes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can do everything on personnes"
  ON personnes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Aliments: Lecture publique, modification admin seulement
CREATE POLICY "Everyone can view aliments"
  ON aliments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage aliments"
  ON aliments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Nutriments: Lecture publique, modification admin
CREATE POLICY "Everyone can view nutriments"
  ON nutriments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage nutriments"
  ON nutriments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Activités: Lecture publique, modification admin
CREATE POLICY "Everyone can view activites"
  ON activites_physiques FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage activites"
  ON activites_physiques FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Conditions médicales: Lecture publique, modification admin
CREATE POLICY "Everyone can view conditions"
  ON conditions_medicales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage conditions"
  ON conditions_medicales FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Allergies: Lecture publique, modification admin
CREATE POLICY "Everyone can view allergies"
  ON allergies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage allergies"
  ON allergies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Préférences: Lecture publique, modification admin
CREATE POLICY "Everyone can view preferences"
  ON preferences_alimentaires FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage preferences"
  ON preferences_alimentaires FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Objectifs: Lecture publique, modification admin
CREATE POLICY "Everyone can view objectifs"
  ON objectifs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage objectifs"
  ON objectifs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Programmes: Lecture publique, modification admin
CREATE POLICY "Everyone can view programmes"
  ON programmes_bien_etre FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage programmes"
  ON programmes_bien_etre FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Recettes: Lecture publique, modification admin
CREATE POLICY "Everyone can view recettes"
  ON recettes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage recettes"
  ON recettes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Groupes alimentaires: Lecture publique, modification admin
CREATE POLICY "Everyone can view groupes"
  ON groupes_alimentaires FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage groupes"
  ON groupes_alimentaires FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Recommandations: Les utilisateurs voient uniquement leurs recommandations
CREATE POLICY "Users can view own recommendations"
  ON recommandations FOR SELECT
  TO authenticated
  USING (
    personne_id IN (
      SELECT id FROM personnes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all recommendations"
  ON recommandations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

-- Relations personnelles: Les utilisateurs gèrent leurs propres relations
CREATE POLICY "Users manage own aliments consumption"
  ON personnes_aliments FOR ALL
  TO authenticated
  USING (
    personne_id IN (
      SELECT id FROM personnes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own activites"
  ON personnes_activites FOR ALL
  TO authenticated
  USING (
    personne_id IN (
      SELECT id FROM personnes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own conditions"
  ON personnes_conditions FOR ALL
  TO authenticated
  USING (
    personne_id IN (
      SELECT id FROM personnes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own allergies"
  ON personnes_allergies FOR ALL
  TO authenticated
  USING (
    personne_id IN (
      SELECT id FROM personnes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own preferences"
  ON personnes_preferences FOR ALL
  TO authenticated
  USING (
    personne_id IN (
      SELECT id FROM personnes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own programmes"
  ON personnes_programmes FOR ALL
  TO authenticated
  USING (
    personne_id IN (
      SELECT id FROM personnes WHERE user_id = auth.uid()
    )
  );

-- Relations publiques en lecture
CREATE POLICY "Everyone can view aliments_nutriments"
  ON aliments_nutriments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can view recommandations_conditions"
  ON aliments_recommandes_conditions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can view contre_indications"
  ON aliments_contre_indiques_conditions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can view recettes_aliments"
  ON recettes_aliments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can view programmes_activites"
  ON programmes_activites FOR SELECT
  TO authenticated
  USING (true);

-- Admins peuvent modifier les relations publiques
CREATE POLICY "Admins manage aliments_nutriments"
  ON aliments_nutriments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

CREATE POLICY "Admins manage recommandations_conditions"
  ON aliments_recommandes_conditions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

CREATE POLICY "Admins manage contre_indications"
  ON aliments_contre_indiques_conditions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

CREATE POLICY "Admins manage recettes_aliments"
  ON recettes_aliments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );

CREATE POLICY "Admins manage programmes_activites"
  ON programmes_activites FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personnes
      WHERE personnes.user_id = auth.uid()
      AND personnes.role = 'admin'
    )
  );
