import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { alimentsAPI, recettesAPI, entitiesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('aliments');
  const [items, setItems] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [nutriments, setNutriments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [view, isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupesRes, nutrimentsRes] = await Promise.all([
        entitiesAPI.getGroupes(),
        entitiesAPI.getNutriments()
      ]);
      setGroupes(groupesRes.data);
      setNutriments(nutrimentsRes.data);

      if (view === 'aliments') {
        const res = await alimentsAPI.getAll();
        setItems(res.data);
      } else if (view === 'recettes') {
        const res = await recettesAPI.getAll();
        setItems(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (view === 'aliments') {
        await alimentsAPI.create(formData);
      } else if (view === 'recettes') {
        await recettesAPI.create(formData);
      }
      setShowForm(false);
      setFormData({});
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    try {
      if (view === 'aliments') {
        await alimentsAPI.delete(id);
      } else if (view === 'recettes') {
        await recettesAPI.delete(id);
      }
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="container">
      <h1>Administration</h1>
      
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setView('aliments')}
            className={view === 'aliments' ? '' : 'btn-secondary'}
          >
            Aliments
          </button>
          <button
            onClick={() => setView('recettes')}
            className={view === 'recettes' ? '' : 'btn-secondary'}
          >
            Recettes
          </button>
        </div>

        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : `+ Nouveau ${view === 'aliments' ? 'Aliment' : 'Recette'}`}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ background: '#f5f5f5' }}>
          <h3>Créer {view === 'aliments' ? 'un aliment' : 'une recette'}</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                value={formData.nom || ''}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>

            {view === 'aliments' && (
              <>
                <div className="form-group">
                  <label>Calories</label>
                  <input
                    type="number"
                    value={formData.calories || ''}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Groupe alimentaire</label>
                  <select
                    value={formData.groupe_id || ''}
                    onChange={(e) => setFormData({ ...formData, groupe_id: parseInt(e.target.value) })}
                  >
                    <option value="">Aucun</option>
                    {groupes.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
                  </select>
                </div>
              </>
            )}

            {view === 'recettes' && (
              <>
                <div className="form-group">
                  <label>Temps de préparation (min)</label>
                  <input
                    type="number"
                    value={formData.temps_preparation || ''}
                    onChange={(e) => setFormData({ ...formData, temps_preparation: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Niveau de difficulté</label>
                  <select
                    value={formData.niveau_difficulte || ''}
                    onChange={(e) => setFormData({ ...formData, niveau_difficulte: e.target.value })}
                  >
                    <option value="">Choisir...</option>
                    <option value="Facile">Facile</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Difficile">Difficile</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>

            <button type="submit">Créer</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Liste des {view}</h3>
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Nom</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{item.id}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{item.nom}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-danger"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.9rem' }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
