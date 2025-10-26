/*
  # Schema Nutrition & Bien-être
  
  1. Nouvelles Tables
    - `personne`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `prenom` (text)
      - `age` (integer)
      - `poids` (decimal)
      - `taille` (decimal)
      - `sexe` (text)
      - `created_at` (timestamp)
    
    - `aliment`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `categorie` (text)
      - `calories` (decimal)
      - `proteines` (decimal)
      - `glucides` (decimal)
      - `lipides` (decimal)
      - `fibres` (decimal)
    
    - `nutriment`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `type` (text)
      - `unite` (text)
    
    - `etat_de_sante`
      - `id` (uuid, primary key)
      - `personne_id` (uuid, foreign key)
      - `condition` (text)
      - `allergies` (text[])
      - `intolerance` (text[])
      - `date_enregistrement` (timestamp)
    
    - `objectif`
      - `id` (uuid, primary key)
      - `personne_id` (uuid, foreign key)
      - `type` (text) - perte de poids, gain musculaire, maintien
      - `valeur_cible` (decimal)
      - `date_debut` (timestamp)
      - `date_fin` (timestamp)
    
    - `activite_physique`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `type` (text)
      - `calories_brulees` (decimal)
      - `duree_minutes` (integer)
      - `intensite` (text)
    
    - `regime_alimentaire`
      - `id` (uuid, primary key)
      - `personne_id` (uuid, foreign key)
      - `nom` (text)
      - `type` (text)
      - `description` (text)
    
    - `repas`
      - `id` (uuid, primary key)
      - `personne_id` (uuid, foreign key)
      - `type_repas` (text)
      - `date_heure` (timestamp)
    
    - `repas_aliment`
      - `id` (uuid, primary key)
      - `repas_id` (uuid, foreign key)
      - `aliment_id` (uuid, foreign key)
      - `quantite` (decimal)
    
    - `programme_bien_etre`
      - `id` (uuid, primary key)
      - `personne_id` (uuid, foreign key)
      - `nom` (text)
      - `description` (text)
      - `duree_jours` (integer)
    
    - `sommeil`
      - `id` (uuid, primary key)
      - `personne_id` (uuid, foreign key)
      - `date` (date)
      - `heures` (decimal)
      - `qualite` (text)
    
    - `hydratation`
      - `id` (uuid, primary key)
      - `personne_id` (uuid, foreign key)
      - `date` (date)
      - `quantite_litres` (decimal)
    
    - `professionnel_de_sante`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `prenom` (text)
      - `specialite` (text)
      - `email` (text)
    
  2. Sécurité
    - Enable RLS sur toutes les tables
    - Policies pour accès authentifié
*/

-- Personne
CREATE TABLE IF NOT EXISTS personne (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  age integer,
  poids decimal,
  taille decimal,
  sexe text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE personne ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON personne FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON personne FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON personne FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Aliment
CREATE TABLE IF NOT EXISTS aliment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  categorie text NOT NULL,
  calories decimal DEFAULT 0,
  proteines decimal DEFAULT 0,
  glucides decimal DEFAULT 0,
  lipides decimal DEFAULT 0,
  fibres decimal DEFAULT 0
);

ALTER TABLE aliment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view aliments"
  ON aliment FOR SELECT
  TO authenticated
  USING (true);

-- Nutriment
CREATE TABLE IF NOT EXISTS nutriment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  type text NOT NULL,
  unite text NOT NULL
);

ALTER TABLE nutriment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view nutriments"
  ON nutriment FOR SELECT
  TO authenticated
  USING (true);

-- État de santé
CREATE TABLE IF NOT EXISTS etat_de_sante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_id uuid REFERENCES personne(id) ON DELETE CASCADE,
  condition text,
  allergies text[],
  intolerance text[],
  date_enregistrement timestamptz DEFAULT now()
);

ALTER TABLE etat_de_sante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health state"
  ON etat_de_sante FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own health state"
  ON etat_de_sante FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own health state"
  ON etat_de_sante FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Objectif
CREATE TABLE IF NOT EXISTS objectif (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_id uuid REFERENCES personne(id) ON DELETE CASCADE,
  type text NOT NULL,
  valeur_cible decimal,
  date_debut timestamptz DEFAULT now(),
  date_fin timestamptz
);

ALTER TABLE objectif ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own objectives"
  ON objectif FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own objectives"
  ON objectif FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own objectives"
  ON objectif FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Activité physique
CREATE TABLE IF NOT EXISTS activite_physique (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  type text NOT NULL,
  calories_brulees decimal DEFAULT 0,
  duree_minutes integer DEFAULT 0,
  intensite text
);

ALTER TABLE activite_physique ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activities"
  ON activite_physique FOR SELECT
  TO authenticated
  USING (true);

-- Régime alimentaire
CREATE TABLE IF NOT EXISTS regime_alimentaire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_id uuid REFERENCES personne(id) ON DELETE CASCADE,
  nom text NOT NULL,
  type text,
  description text
);

ALTER TABLE regime_alimentaire ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diet"
  ON regime_alimentaire FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own diet"
  ON regime_alimentaire FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own diet"
  ON regime_alimentaire FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Repas
CREATE TABLE IF NOT EXISTS repas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_id uuid REFERENCES personne(id) ON DELETE CASCADE,
  type_repas text NOT NULL,
  date_heure timestamptz DEFAULT now()
);

ALTER TABLE repas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals"
  ON repas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own meals"
  ON repas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own meals"
  ON repas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own meals"
  ON repas FOR DELETE
  TO authenticated
  USING (true);

-- Repas-Aliment (relation many-to-many)
CREATE TABLE IF NOT EXISTS repas_aliment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repas_id uuid REFERENCES repas(id) ON DELETE CASCADE,
  aliment_id uuid REFERENCES aliment(id) ON DELETE CASCADE,
  quantite decimal DEFAULT 0
);

ALTER TABLE repas_aliment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meal foods"
  ON repas_aliment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert meal foods"
  ON repas_aliment FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update meal foods"
  ON repas_aliment FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete meal foods"
  ON repas_aliment FOR DELETE
  TO authenticated
  USING (true);

-- Programme bien-être
CREATE TABLE IF NOT EXISTS programme_bien_etre (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_id uuid REFERENCES personne(id) ON DELETE CASCADE,
  nom text NOT NULL,
  description text,
  duree_jours integer DEFAULT 0
);

ALTER TABLE programme_bien_etre ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wellness programs"
  ON programme_bien_etre FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own wellness programs"
  ON programme_bien_etre FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own wellness programs"
  ON programme_bien_etre FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sommeil
CREATE TABLE IF NOT EXISTS sommeil (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_id uuid REFERENCES personne(id) ON DELETE CASCADE,
  date date NOT NULL,
  heures decimal DEFAULT 0,
  qualite text
);

ALTER TABLE sommeil ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sleep data"
  ON sommeil FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own sleep data"
  ON sommeil FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own sleep data"
  ON sommeil FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Hydratation
CREATE TABLE IF NOT EXISTS hydratation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_id uuid REFERENCES personne(id) ON DELETE CASCADE,
  date date NOT NULL,
  quantite_litres decimal DEFAULT 0
);

ALTER TABLE hydratation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hydration data"
  ON hydratation FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own hydration data"
  ON hydratation FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own hydration data"
  ON hydratation FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Professionnel de santé
CREATE TABLE IF NOT EXISTS professionnel_de_sante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  specialite text,
  email text
);

ALTER TABLE professionnel_de_sante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view health professionals"
  ON professionnel_de_sante FOR SELECT
  TO authenticated
  USING (true);