import { useState } from 'react';
import { Play, Loader2, Code } from 'lucide-react';
import { api } from '../lib/api';

export default function SPARQLQuery() {
  const [query, setQuery] = useState(`PREFIX nutrition: <http://www.nutrition-wellness.org/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?aliment ?nom ?calories
WHERE {
  ?aliment a nutrition:Aliment .
  ?aliment nutrition:nom ?nom .
  ?aliment nutrition:calories ?calories .
}
LIMIT 10`);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExecute = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await api.executeSPARQL(query);
      setResults(data.results || []);
    } catch (err) {
      setError('Erreur lors de l\'exécution de la requête SPARQL');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    {
      name: 'Tous les aliments',
      query: `PREFIX nutrition: <http://www.nutrition-wellness.org/ontology#>

SELECT ?aliment ?nom ?calories
WHERE {
  ?aliment a nutrition:Aliment .
  ?aliment nutrition:nom ?nom .
  ?aliment nutrition:calories ?calories .
}
LIMIT 10`
    },
    {
      name: 'Aliments riches en protéines',
      query: `PREFIX nutrition: <http://www.nutrition-wellness.org/ontology#>

SELECT ?aliment ?nom ?proteines
WHERE {
  ?aliment a nutrition:Aliment .
  ?aliment nutrition:nom ?nom .
  ?aliment nutrition:proteines ?proteines .
  FILTER(?proteines > 10)
}
LIMIT 10`
    },
    {
      name: 'Classes de l\'ontologie',
      query: `PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?class ?label
WHERE {
  ?class a owl:Class .
  ?class rdfs:label ?label .
}`
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Code className="w-6 h-6" />
          Requêtes SPARQL
        </h2>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exemples de requêtes
        </label>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example.query)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requête SPARQL
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          rows={12}
          placeholder="Entrez votre requête SPARQL..."
        />
      </div>

      <button
        onClick={handleExecute}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Play className="w-5 h-5" />
        )}
        Exécuter la requête
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Résultats ({results.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(results[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(result).map((value: any, i) => (
                      <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
