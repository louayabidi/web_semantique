import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchResult {
  type: string;
  data: any[];
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      await performSemanticSearch(query.toLowerCase());
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSemanticSearch = async (searchQuery: string) => {
    const searchResults: SearchResult[] = [];

    if (searchQuery.includes('diabète') || searchQuery.includes('diabete')) {
      const { data: conditions } = await supabase
        .from('conditions_medicales')
        .select('*')
        .ilike('nom', '%diabète%');

      if (conditions && conditions.length > 0) {
        const conditionId = conditions[0].id;

        const { data: alimentsRecommandes } = await supabase
          .from('aliments_recommandes_conditions')
          .select('aliment_id, aliments(*)')
          .eq('condition_id', conditionId);

        if (alimentsRecommandes) {
          searchResults.push({
            type: 'Aliments recommandés pour le diabète',
            data: alimentsRecommandes.map((a: any) => a.aliments),
          });
        }

        const { data: alimentsContreIndiques } = await supabase
          .from('aliments_contre_indiques_conditions')
          .select('aliment_id, aliments(*)')
          .eq('condition_id', conditionId);

        if (alimentsContreIndiques) {
          searchResults.push({
            type: 'Aliments à éviter pour le diabète',
            data: alimentsContreIndiques.map((a: any) => a.aliments),
          });
        }
      }
    }

    if (searchQuery.includes('fruit') || searchQuery.includes('fruits')) {
      const { data: groupe } = await supabase
        .from('groupes_alimentaires')
        .select('*')
        .eq('nom', 'Fruits')
        .maybeSingle();

      if (groupe) {
        const { data: aliments } = await supabase
          .from('aliments')
          .select('*')
          .eq('groupe_alimentaire_id', groupe.id);

        if (aliments) {
          searchResults.push({
            type: 'Fruits disponibles',
            data: aliments,
          });
        }
      }
    }

    if (searchQuery.includes('légume') || searchQuery.includes('legume')) {
      const { data: groupe } = await supabase
        .from('groupes_alimentaires')
        .select('*')
        .eq('nom', 'Légumes')
        .maybeSingle();

      if (groupe) {
        const { data: aliments } = await supabase
          .from('aliments')
          .select('*')
          .eq('groupe_alimentaire_id', groupe.id);

        if (aliments) {
          searchResults.push({
            type: 'Légumes disponibles',
            data: aliments,
          });
        }
      }
    }

    if (searchQuery.includes('fibre') || searchQuery.includes('fibres')) {
      const { data: aliments } = await supabase
        .from('aliments')
        .select('*')
        .eq('riche_en_fibres', true);

      if (aliments) {
        searchResults.push({
          type: 'Aliments riches en fibres',
          data: aliments,
        });
      }
    }

    if (searchQuery.includes('cardio') || searchQuery.includes('course')) {
      const { data: activites } = await supabase
        .from('activites_physiques')
        .select('*')
        .eq('type_activite', 'Cardio');

      if (activites) {
        searchResults.push({
          type: 'Activités cardiovasculaires',
          data: activites,
        });
      }
    }

    if (searchQuery.includes('poids') || searchQuery.includes('maigrir')) {
      const { data: objectifs } = await supabase
        .from('objectifs')
        .select('*, programmes_bien_etre(*)')
        .ilike('objectif_bien_etre', '%poids%');

      if (objectifs) {
        const programmes = objectifs.flatMap((o: any) => o.programmes_bien_etre || []);
        if (programmes.length > 0) {
          searchResults.push({
            type: 'Programmes pour la perte de poids',
            data: programmes,
          });
        }
      }
    }

    if (searchResults.length === 0) {
      const { data: aliments } = await supabase
        .from('aliments')
        .select('*')
        .ilike('nom', `%${searchQuery}%`)
        .limit(10);

      if (aliments && aliments.length > 0) {
        searchResults.push({
          type: 'Aliments correspondants',
          data: aliments,
        });
      }

      const { data: activites } = await supabase
        .from('activites_physiques')
        .select('*')
        .ilike('nom', `%${searchQuery}%`)
        .limit(10);

      if (activites && activites.length > 0) {
        searchResults.push({
          type: 'Activités correspondantes',
          data: activites,
        });
      }
    }

    setResults(searchResults);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-800">Recherche Sémantique</h1>
            </div>
            <p className="text-gray-600">
              Posez vos questions en langage naturel pour trouver des informations
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Quels aliments pour le diabète ? Aliments riches en fibres..."
                className="w-full px-6 py-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Exemples de questions:</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Aliments pour le diabète',
                'Activités cardio',
                'Aliments riches en fibres',
                'Programme perte de poids',
                'Quels fruits disponibles',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setQuery(example);
                    performSemanticSearch(example.toLowerCase());
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-lg text-sm transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
              <p className="mt-4 text-gray-600">Recherche en cours...</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-6">
              {results.map((result, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">{result.type}</h2>
                  <div className="grid gap-4">
                    {result.data.map((item: any) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-800 mb-2">{item.nom}</h3>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {item.calories && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {item.calories} kcal
                            </span>
                          )}
                          {item.type_activite && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              {item.type_activite}
                            </span>
                          )}
                          {item.niveau_difficulte && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              {item.niveau_difficulte}
                            </span>
                          )}
                          {item.riche_en_fibres && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Riche en fibres
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Aucun résultat trouvé pour votre recherche</p>
              <p className="text-gray-500 text-sm mt-2">Essayez avec d'autres mots-clés</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
