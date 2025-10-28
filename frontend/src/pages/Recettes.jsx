import React, { useState, useEffect } from 'react';
import { recettesAPI } from '../services/api';

const Recettes = () => {
  const [recettes, setRecettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRecettes();
  }, [search]);

  const loadRecettes = async () => {
    try {
      setLoading(true);
      const response = await recettesAPI.getAll({ search: search || undefined });
      setRecettes(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des recettes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Recettes</h1>
      
      <div className="card">
        <div className="form-group">
          <label>Rechercher une recette</label>
          <input
            type="text"
            placeholder="Nom de la recette..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="grid">
          {recettes.map(recette => (
            <div key={recette.id} className="card">
              <h3>{recette.nom}</h3>
              {recette.description && <p>{recette.description}</p>}
              {recette.temps_preparation && (
                <p><strong>⏱ Temps:</strong> {recette.temps_preparation} min</p>
              )}
              {recette.niveau_difficulte && (
                <p><strong>📊 Difficulté:</strong> {recette.niveau_difficulte}</p>
              )}
              {recette.calories_totales && (
                <p><strong>🔥 Calories:</strong> {recette.calories_totales} kcal</p>
              )}
              {recette.aliments && recette.aliments.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Ingrédients:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    {recette.aliments.slice(0, 5).map(aliment => (
                      <li key={aliment.id}>{aliment.nom}</li>
                    ))}
                    {recette.aliments.length > 5 && <li>...</li>}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {!loading && recettes.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Aucune recette trouvée</p>
        </div>
      )}
    </div>
  );
};

export default Recettes;
