import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      personnes: {
        Row: {
          id: string;
          user_id: string;
          nom: string;
          age: number | null;
          genre: 'Homme' | 'Femme' | 'Autre' | null;
          poids: number | null;
          taille: number | null;
          role: 'user' | 'admin' | 'professionnel';
          niveau_energie: number | null;
          niveau_stress: number | null;
          temps_sommeil: number | null;
          objectif_poids: string | null;
          objectif_bien_etre: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['personnes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['personnes']['Insert']>;
      };
    };
  };
};
