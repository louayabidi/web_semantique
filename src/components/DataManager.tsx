import { useState } from 'react';
import { Database, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DataManager() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sampleAliments = [
    { nom: 'Poulet grillé', categorie: 'Viande', calories: 165, proteines: 31, glucides: 0, lipides: 3.6, fibres: 0 },
    { nom: 'Riz complet', categorie: 'Céréales', calories: 111, proteines: 2.6, glucides: 23, lipides: 0.9, fibres: 1.8 },
    { nom: 'Brocoli', categorie: 'Légume', calories: 34, proteines: 2.8, glucides: 7, lipides: 0.4, fibres: 2.6 },
    { nom: 'Saumon', categorie: 'Poisson', calories: 208, proteines: 20, glucides: 0, lipides: 13, fibres: 0 },
    { nom: 'Avocat', categorie: 'Fruit', calories: 160, proteines: 2, glucides: 9, lipides: 15, fibres: 7 },
    { nom: 'Quinoa', categorie: 'Céréales', calories: 120, proteines: 4.4, glucides: 21, lipides: 1.9, fibres: 2.8 },
    { nom: 'Épinards', categorie: 'Légume', calories: 23, proteines: 2.9, glucides: 3.6, lipides: 0.4, fibres: 2.2 },
    { nom: 'Banane', categorie: 'Fruit', calories: 89, proteines: 1.1, glucides: 23, lipides: 0.3, fibres: 2.6 },
    { nom: 'Yaourt grec', categorie: 'Produit laitier', calories: 59, proteines: 10, glucides: 3.6, lipides: 0.4, fibres: 0 },
    { nom: 'Amandes', categorie: 'Noix', calories: 579, proteines: 21, glucides: 22, lipides: 50, fibres: 12 },
  ];

  const sampleActivites = [
    { nom: 'Course à pied', type: 'cardio', calories_brulees: 300, duree_minutes: 30, intensite: 'élevée' },
    { nom: 'Natation', type: 'cardio', calories_brulees: 250, duree_minutes: 30, intensite: 'moyenne' },
    { nom: 'Yoga', type: 'flexibilité', calories_brulees: 100, duree_minutes: 45, intensite: 'faible' },
    { nom: 'Musculation', type: 'musculation', calories_brulees: 200, duree_minutes: 45, intensite: 'élevée' },
    { nom: 'Vélo', type: 'cardio', calories_brulees: 280, duree_minutes: 30, intensite: 'moyenne' },
    { nom: 'Marche rapide', type: 'cardio', calories_brulees: 150, duree_minutes: 30, intensite: 'faible' },
    { nom: 'HIIT', type: 'cardio', calories_brulees: 400, duree_minutes: 20, intensite: 'très élevée' },
    { nom: 'Pilates', type: 'flexibilité', calories_brulees: 120, duree_minutes: 45, intensite: 'faible' },
  ];

  const loadSampleData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { data: existingAliments } = await supabase.from('aliment').select('id').limit(1);

      if (!existingAliments || existingAliments.length === 0) {
        const { error: alimentError } = await supabase.from('aliment').insert(sampleAliments);
        if (alimentError) throw alimentError;
      }

      const { data: existingActivites } = await supabase.from('activite_physique').select('id').limit(1);

      if (!existingActivites || existingActivites.length === 0) {
        const { error: activiteError } = await supabase.from('activite_physique').insert(sampleActivites);
        if (activiteError) throw activiteError;
      }

      setMessage('Données d\'exemple chargées avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Database className="w-6 h-6 text-blue-600" />
        Gestion des Données
      </h2>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Charger des données d'exemple</h3>
          <p className="text-sm text-gray-600 mb-4">
            Importer des aliments et activités physiques dans la base de données pour tester l'application.
          </p>
          <button
            onClick={loadSampleData}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Charger les données
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.includes('succès') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Aliments</h4>
            <p className="text-sm text-gray-600">
              {sampleAliments.length} aliments seront ajoutés avec leurs valeurs nutritionnelles.
            </p>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Activités Physiques</h4>
            <p className="text-sm text-gray-600">
              {sampleActivites.length} activités avec calories brûlées et intensité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
