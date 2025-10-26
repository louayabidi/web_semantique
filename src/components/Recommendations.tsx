import { useState, useEffect } from 'react';
import { Heart, Activity, Apple, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export default function Recommendations() {
  const [personneId, setPersonneId] = useState('');
  const [personnes, setPersonnes] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPersonnes();
  }, []);

  const loadPersonnes = async () => {
    try {
      const { data, error } = await supabase.from('personne').select('*');
      if (error) throw error;
      setPersonnes(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des personnes:', err);
    }
  };

  const handleGetRecommendations = async () => {
    if (!personneId) return;

    setLoading(true);
    setError('');
    try {
      const data = await api.getRecommendations(personneId);
      setRecommendations(data);
    } catch (err) {
      setError('Erreur lors de la génération des recommandations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" />
        Recommandations Personnalisées
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionnez un profil
        </label>
        <div className="flex gap-4">
          <select
            value={personneId}
            onChange={(e) => setPersonneId(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choisir un profil --</option>
            {personnes.map((personne) => (
              <option key={personne.id} value={personne.id}>
                {personne.prenom} {personne.nom} ({personne.age} ans)
              </option>
            ))}
          </select>
          <button
            onClick={handleGetRecommendations}
            disabled={!personneId || loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            Générer
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {recommendations && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">{recommendations.raison}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <Apple className="w-5 h-5 text-green-600" />
              Aliments Recommandés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.aliments.map((aliment: any) => (
                <div
                  key={aliment.id}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:border-green-400 transition-colors"
                >
                  <h4 className="font-semibold text-gray-800 mb-2">{aliment.nom}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Catégorie: {aliment.categorie}</p>
                    <p>Calories: {aliment.calories} kcal</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs bg-green-100 px-2 py-1 rounded">
                        Protéines: {aliment.proteines}g
                      </span>
                      <span className="text-xs bg-green-100 px-2 py-1 rounded">
                        Glucides: {aliment.glucides}g
                      </span>
                      <span className="text-xs bg-green-100 px-2 py-1 rounded">
                        Lipides: {aliment.lipides}g
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              Activités Recommandées
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.activites.map((activite: any) => (
                <div
                  key={activite.id}
                  className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:border-orange-400 transition-colors"
                >
                  <h4 className="font-semibold text-gray-800 mb-2">{activite.nom}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Type: {activite.type}</p>
                    <p>Calories brûlées: {activite.calories_brulees} kcal</p>
                    <p>Durée: {activite.duree_minutes} minutes</p>
                    {activite.intensite && (
                      <span className="inline-block text-xs bg-orange-100 px-2 py-1 rounded mt-2">
                        Intensité: {activite.intensite}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!recommendations && !loading && (
        <div className="text-center text-gray-500 py-12">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Sélectionnez un profil pour obtenir des recommandations personnalisées</p>
        </div>
      )}
    </div>
  );
}
