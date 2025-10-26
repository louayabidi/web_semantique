import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Personne = {
  id: string;
  nom: string;
  prenom: string;
  age?: number;
  poids?: number;
  taille?: number;
  sexe?: string;
  created_at: string;
};

export type Aliment = {
  id: string;
  nom: string;
  categorie: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  fibres: number;
};

export type EtatDeSante = {
  id: string;
  personne_id: string;
  condition?: string;
  allergies?: string[];
  intolerance?: string[];
  date_enregistrement: string;
};

export type Objectif = {
  id: string;
  personne_id: string;
  type: string;
  valeur_cible?: number;
  date_debut: string;
  date_fin?: string;
};

export type ActivitePhysique = {
  id: string;
  nom: string;
  type: string;
  calories_brulees: number;
  duree_minutes: number;
  intensite?: string;
};
