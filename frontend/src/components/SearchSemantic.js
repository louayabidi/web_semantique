import React, { useState } from 'react';
import { api } from '../services/api';
import './SearchSemantic.css';

const SearchSemantic = () => {
  const [question, setQuestion] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sparqlQuery, setSparqlQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setLoading(true);
      const response = await api.rechercheSemantique(question);
      setResults(response.data.results);
      setSparqlQuery(response.data.sparql_query);
    } catch (error) {
      console.error('Erreur recherche:', error);
      alert('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    "aliments pour diabétique",
    "aliments pour hypertension", 
    "recettes santé",
    "activités sportives"
  ];

  return (
    <div className="search-container">
      <h2>🔍 Recherche Sémantique Intelligente</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Posez votre question en français... Ex: 'aliments pour diabétique'"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="search-input"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '🔎 Recherche...' : '🔎 Rechercher'}
        </button>
      </form>

      {/* Questions d'exemple */}
      <div className="examples">
        <h4>Exemples de questions :</h4>
        <div className="example-buttons">
          {exampleQuestions.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuestion(example)}
              className="example-btn"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Requête SPARQL générée */}
      {sparqlQuery && (
        <div className="sparql-query">
          <h4>Requête SPARQL générée :</h4>
          <pre>{sparqlQuery}</pre>
        </div>
      )}

      {/* Résultats */}
      <div className="results">
        <h3>📊 Résultats ({results.length})</h3>
        {loading ? (
          <p>Recherche en cours...</p>
        ) : (
          <div className="results-grid">
            {results.map((result, index) => (
              <div key={index} className="result-card">
                <div className="result-header">
                  <strong>{result.nom?.value || 'Sans nom'}</strong>
                </div>
                <div className="result-body">
                  {result.calories?.value && (
                    <p>🔥 Calories: {result.calories.value}</p>
                  )}
                  {result.type?.value && (
                    <p>📁 Type: {result.type.value.split('#')[1]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {results.length === 0 && !loading && question && (
          <p className="no-results">Aucun résultat trouvé</p>
        )}
      </div>
    </div>
  );
};

export default SearchSemantic;