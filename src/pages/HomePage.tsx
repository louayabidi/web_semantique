import { useEffect, useState } from 'react';
import { Apple, Activity, Heart, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  alimentsCount: number;
  activitesCount: number;
  programmesCount: number;
}

export default function HomePage() {
  const { personne } = useAuth();
  const [stats, setStats] = useState<Stats>({
    alimentsCount: 0,
    activitesCount: 0,
    programmesCount: 0,
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    if (personne) {
      fetchRecommendations();
    }
  }, [personne]);

  const fetchStats = async () => {
    try {
      const [aliments, activites, programmes] = await Promise.all([
        supabase.from('aliments').select('id', { count: 'exact', head: true }),
        supabase.from('activites_physiques').select('id', { count: 'exact', head: true }),
        supabase.from('programmes_bien_etre').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        alimentsCount: aliments.count || 0,
        activitesCount: activites.count || 0,
        programmesCount: programmes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommandations')
        .select('*')
        .eq('personne_id', personne?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Bienvenue, {personne?.nom} !
          </h1>
          <p className="text-gray-600">
            Découvrez vos recommandations personnalisées pour une meilleure santé
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Apple className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.alimentsCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Aliments</h3>
            <p className="text-gray-600 text-sm">Catalogués dans la base</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.activitesCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Activités</h3>
            <p className="text-gray-600 text-sm">Exercices disponibles</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.programmesCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Programmes</h3>
            <p className="text-gray-600 text-sm">De bien-être disponibles</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">Vos Recommandations</h2>
          </div>

          {loading ? (
            <p className="text-gray-600">Chargement...</p>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{rec.titre}</h3>
                      <p className="text-gray-600 text-sm">{rec.contenu}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {rec.type_recommandation}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Aucune recommandation pour le moment</p>
              <p className="text-gray-500 text-sm">
                Complétez votre profil pour recevoir des recommandations personnalisées
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Recherche Sémantique</h3>
            <p className="mb-4 opacity-90">
              Posez des questions en langage naturel comme "Quels aliments pour le diabète ?"
            </p>
            <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
              Essayer maintenant
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Profil Personnalisé</h3>
            <p className="mb-4 opacity-90">
              Complétez votre profil avec vos conditions médicales et objectifs
            </p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Mon profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
