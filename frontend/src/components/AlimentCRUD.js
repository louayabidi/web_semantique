import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './CRUD.css';

const AlimentCRUD = () => {
  const [aliments, setAliments] = useState([]);
  const [formData, setFormData] = useState({ nom: '', calories: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAliments();
  }, []);

  const loadAliments = async () => {
    try {
      setLoading(true);
      const response = await api.getAliments();
      setAliments(response.data.aliments);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des aliments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAliment(formData);
      setFormData({ nom: '', calories: '' });
      loadAliments();
      alert('Aliment créé avec succès!');
    } catch (error) {
      console.error('Erreur création:', error);
      alert('Erreur lors de la création');
    }
  };

  return (
    <div className="crud-container">
      <h2>🍎 Gestion des Aliments</h2>
      
      {/* Formulaire de création */}
      <form onSubmit={handleSubmit} className="crud-form">
        <h3>Ajouter un aliment</h3>
        <input
          type="text"
          placeholder="Nom de l'aliment"
          value={formData.nom}
          onChange={(e) => setFormData({...formData, nom: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Calories"
          value={formData.calories}
          onChange={(e) => setFormData({...formData, calories: e.target.value})}
        />
        <button type="submit" className="btn-primary">
          ➕ Créer Aliment
        </button>
      </form>

      {/* Liste des aliments */}
      <div className="crud-list">
        <h3>Liste des Aliments ({aliments.length})</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="cards-container">
            {aliments.map((aliment, index) => (
              <div key={index} className="card">
                <div className="card-header">
                  <strong>🍎 {aliment.nom?.value || 'Sans nom'}</strong>
                </div>
                <div className="card-body">
                  <p>🔥 Calories: {aliment.calories?.value || 'Non spécifié'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {aliments.length === 0 && !loading && (
          <p className="no-data">Aucun aliment trouvé</p>
        )}
      </div>
    </div>
  );
};

export default AlimentCRUD;