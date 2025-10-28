import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './CRUD.css';

const PersonneCRUD = () => {
  const [personnes, setPersonnes] = useState([]);
  const [formData, setFormData] = useState({ nom: '', age: '', poids: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPersonnes();
  }, []);

  const loadPersonnes = async () => {
    try {
      setLoading(true);
      const response = await api.getPersonnes();
      setPersonnes(response.data.personnes);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des personnes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createPersonne(formData);
      setFormData({ nom: '', age: '', poids: '' });
      loadPersonnes();
      alert('Personne créée avec succès!');
    } catch (error) {
      console.error('Erreur création:', error);
      alert('Erreur lors de la création');
    }
  };

  const handleDelete = async (personneUri) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette personne?')) {
      try {
        const personneId = personneUri.split('#')[1];
        await api.deletePersonne(personneId);
        loadPersonnes();
        alert('Personne supprimée!');
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="crud-container">
      <h2>👥 Gestion des Personnes</h2>
      
      {/* Formulaire de création */}
      <form onSubmit={handleSubmit} className="crud-form">
        <h3>Ajouter une personne</h3>
        <input
          type="text"
          placeholder="Nom"
          value={formData.nom}
          onChange={(e) => setFormData({...formData, nom: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Âge"
          value={formData.age}
          onChange={(e) => setFormData({...formData, age: e.target.value})}
        />
        <input
          type="number"
          placeholder="Poids (kg)"
          step="0.1"
          value={formData.poids}
          onChange={(e) => setFormData({...formData, poids: e.target.value})}
        />
        <button type="submit" className="btn-primary">
          ➕ Créer Personne
        </button>
      </form>

      {/* Liste des personnes */}
      <div className="crud-list">
        <h3>Liste des Personnes ({personnes.length})</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="cards-container">
            {personnes.map((personne, index) => (
              <div key={index} className="card">
                <div className="card-header">
                  <strong>👤 {personne.nom?.value || 'Sans nom'}</strong>
                </div>
                <div className="card-body">
                  <p>🎂 Âge: {personne.age?.value || 'Non spécifié'}</p>
                  <p>⚖️ Poids: {personne.poids?.value ? `${personne.poids.value} kg` : 'Non spécifié'}</p>
                </div>
                <div className="card-footer">
                  <button 
                    onClick={() => handleDelete(personne.personne.value)}
                    className="btn-danger"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {personnes.length === 0 && !loading && (
          <p className="no-data">Aucune personne trouvée</p>
        )}
      </div>
    </div>
  );
};

export default PersonneCRUD;