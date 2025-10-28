import React, { useState, useEffect } from 'react';
import { alimentsAPI, entitiesAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Catalog = () => {
  const [aliments, setAliments] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedGroupe, setSelectedGroupe] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedGroupe, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [alimentsRes, groupesRes] = await Promise.all([
        alimentsAPI.getAll({ groupe_id: selectedGroupe || undefined, search: search || undefined }),
        entitiesAPI.getGroupes()
      ]);
      setAliments(alimentsRes.data);
      setGroupes(groupesRes.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Catalogue d'aliments</h1>
      
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Rechercher</label>
            <input
              type="text"
              placeholder="Nom de l'aliment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Filtrer par groupe</label>
            <select value={selectedGroupe} onChange={(e) => setSelectedGroupe(e.target.value)}>
              <option value="">Tous les groupes</option>
              {groupes.map(g => (
                <option key={g.id} value={g.id}>{g.nom}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="grid">
          {aliments.map(aliment => (
            <div key={aliment.id} className="card">
              <h3>{aliment.nom}</h3>
              {aliment.calories && <p><strong>Calories:</strong> {aliment.calories} kcal</p>}
              {aliment.groupe && <p><strong>Groupe:</strong> {aliment.groupe.nom}</p>}
              {aliment.description && <p style={{ fontSize: '0.9rem', color: '#666' }}>{aliment.description}</p>}
              {aliment.score_nutritionnel && (
                <p><strong>Score nutritionnel:</strong> {aliment.score_nutritionnel}/100</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {!loading && aliments.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Aucun aliment trouvé</p>
        </div>
      )}
    </div>
  );
};

export default Catalog;
