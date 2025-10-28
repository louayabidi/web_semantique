import React, { useState } from 'react';
import { semanticAPI } from '../services/api';

const Search = () => {
  const [queryType, setQueryType] = useState('nl');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nlExamples = [
    "Quels sont les produits de la catégorie Fruits ?",
    "Quelles recettes pour les diabétiques ?",
    "Quels aliments contiennent des vitamines ?",
    "Liste des allergies connues",
    "Quels sont les objectifs disponibles ?"
  ];

  const sparqlExample = `PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT ?aliment ?nutriment
WHERE {
  ?aliment rdf:type nutrition:Aliment .
  ?aliment nutrition:contient ?nutriment .
  ?nutriment rdf:type nutrition:Nutriment .
}
LIMIT 10`;

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Veuillez entrer une requête');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      let response;
      if (queryType === 'nl') {
        response = await semanticAPI.naturalLanguageSearch(query);
      } else {
        response = await semanticAPI.sparqlQuery(query);
      }
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Recherche Sémantique</h1>
      
      <div className="card">
        <div className="form-group">
          <label>Type de recherche</label>
          <select value={queryType} onChange={(e) => setQueryType(e.target.value)}>
            <option value="nl">Langage Naturel</option>
            <option value="sparql">SPARQL</option>
          </select>
        </div>

        {queryType === 'nl' ? (
          <div>
            <div className="form-group">
              <label>Votre question</label>
              <input
                type="text"
                placeholder="Ex: Quels sont les aliments riches en protéines ?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Exemples de questions :</strong>
              <ul style={{ marginTop: '0.5rem' }}>
                {nlExamples.map((example, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setQuery(example); }}
                      style={{ color: '#4CAF50', textDecoration: 'none' }}
                    >
                      {example}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label>Requête SPARQL</label>
              <textarea
                rows="10"
                placeholder={sparqlExample}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              />
            </div>
            
            <button
              onClick={() => setQuery(sparqlExample)}
              className="btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              Charger l'exemple
            </button>
          </div>
        )}

        <button onClick={handleSearch} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {results && (
        <div className="card">
          <h2>Résultats</h2>
          
          {results.matched_template && (
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Template utilisé: <strong>{results.matched_template}</strong>
            </p>
          )}
          
          {results.sparql_query && queryType === 'nl' && (
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
              <strong>Requête SPARQL générée:</strong>
              <pre style={{ marginTop: '0.5rem', overflow: 'auto' }}>
                {results.sparql_query}
              </pre>
            </div>
          )}
          
          <p><strong>Nombre de résultats:</strong> {results.results?.length || results.count || 0}</p>
          
          {results.results && results.results.length > 0 && (
            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    {Object.keys(results.results[0]).map(key => (
                      <th key={key} style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((value, vidx) => (
                        <td key={vidx} style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {results.message && (
            <div className="card" style={{ background: '#fff3e0', marginTop: '1rem' }}>
              {results.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
