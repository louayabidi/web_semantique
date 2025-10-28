import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './CRUD.css';

const AlimentCRUD = () => {
  const [aliments, setAliments] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    calories: '',
    indexGlycémique: '',
    indiceSatiété: '',
    scoreNutritionnel: '',
    groupes: [],
    nutriments: [],
    recommandations: [],
    contre_indications: [],
    est_riche_en_fibres: false,
    est_index_glycemique_eleve: false
  });
  const [loading, setLoading] = useState(false);
  const [selectedGroupes, setSelectedGroupes] = useState([]);
  const [selectedNutriments, setSelectedNutriments] = useState([]);
  const [selectedRecommandations, setSelectedRecommandations] = useState([]);
  const [selectedContreIndications, setSelectedContreIndications] = useState([]);

  // Données de référence pour les selects
  const groupesOptions = ['Fruits', 'Légumes', 'Protéines', 'Céréales', 'ProduitsLaitiers'];
  const nutrimentsOptions = ['VitamineC', 'Fibres', 'Calcium', 'Fer', 'Magnésium', 'Oméga3'];
  const conditionsOptions = ['DiabèteType1', 'DiabèteType2', 'HypertensionArtérielle', 'ObésitéModérée', 'GrossesseTrimestre2'];

  useEffect(() => {
    loadAliments();
  }, []);

  const loadAliments = async () => {
    try {
      setLoading(true);
      const response = await api.getAliments();
      setAliments(response.data.aliments || []);
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
      const dataToSend = {
        ...formData,
        groupes: selectedGroupes,
        nutriments: selectedNutriments,
        recommandations: selectedRecommandations,
        contre_indications: selectedContreIndications,
        calories: parseInt(formData.calories) || 0,
        indexGlycémique: parseInt(formData.indexGlycémique) || 0,
        indiceSatiété: parseInt(formData.indiceSatiété) || 0,
        scoreNutritionnel: parseInt(formData.scoreNutritionnel) || 0
      };

      await api.createAliment(dataToSend);
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        calories: '',
        indexGlycémique: '',
        indiceSatiété: '',
        scoreNutritionnel: '',
        groupes: [],
        nutriments: [],
        recommandations: [],
        contre_indications: [],
        est_riche_en_fibres: false,
        est_index_glycemique_eleve: false
      });
      setSelectedGroupes([]);
      setSelectedNutriments([]);
      setSelectedRecommandations([]);
      setSelectedContreIndications([]);
      
      loadAliments();
      alert('Aliment créé avec succès!');
    } catch (error) {
      console.error('Erreur création:', error);
      alert('Erreur lors de la création: ' + error.response?.data?.detail || error.message);
    }
  };

  const handleMultiSelect = (value, selectedValues, setSelectedValues) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(item => item !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const renderMultiSelect = (options, selectedValues, setSelectedValues, label) => (
    <div className="form-group">
      <label>{label}:</label>
      <div className="multi-select-container">
        {options.map(option => (
          <div key={option} className="checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => handleMultiSelect(option, selectedValues, setSelectedValues)}
              />
              {option}
            </label>
          </div>
        ))}
      </div>
      <small>Selectionné: {selectedValues.join(', ') || 'Aucun'}</small>
    </div>
  );

  const formatAlimentData = (aliment) => {
    const nom = aliment.nom?.value || 'Sans nom';
    const calories = aliment.calories?.value || 'N/A';
    const indexGlycémique = aliment.indexGlycémique?.value || 'N/A';
    
    // Extraire les relations
    const groupes = aliments.filter(a => a.aliment?.value === aliment.aliment?.value && a.groupe)
      .map(a => a.groupe.value.split('#').pop());
    const nutriments = aliments.filter(a => a.aliment?.value === aliment.aliment?.value && a.nutriment)
      .map(a => a.nutriment.value.split('#').pop());

    return {
      nom,
      calories,
      indexGlycémique,
      groupes: [...new Set(groupes)],
      nutriments: [...new Set(nutriments)]
    };
  };

  // Grouper les aliments par URI pour éviter les doublons
  const uniqueAliments = Array.from(new Set(aliments.map(a => a.aliment?.value)))
    .map(uri => {
      const alimentData = aliments.find(a => a.aliment?.value === uri);
      return formatAlimentData(alimentData);
    });

  return (
    <div className="crud-container">
      <h2>🍎 Gestion des Aliments</h2>
      
      {/* Formulaire de création COMPLET */}
      <form onSubmit={handleSubmit} className="crud-form">
        <h3>➕ Ajouter un nouvel aliment</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Nom de l'aliment *</label>
            <input
              type="text"
              placeholder="Ex: Brocoli Frais"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Calories (pour 100g)</label>
            <input
              type="number"
              placeholder="Ex: 34"
              value={formData.calories}
              onChange={(e) => setFormData({...formData, calories: e.target.value})}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Index Glycémique</label>
            <input
              type="number"
              placeholder="0-100"
              min="0"
              max="100"
              value={formData.indexGlycémique}
              onChange={(e) => setFormData({...formData, indexGlycémique: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Indice de Satiété</label>
            <input
              type="number"
              placeholder="0-100"
              value={formData.indiceSatiété}
              onChange={(e) => setFormData({...formData, indiceSatiété: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Score Nutritionnel</label>
            <input
              type="number"
              placeholder="0-100"
              value={formData.scoreNutritionnel}
              onChange={(e) => setFormData({...formData, scoreNutritionnel: e.target.value})}
            />
          </div>
        </div>

        {/* Sélections multiples */}
        {renderMultiSelect(groupesOptions, selectedGroupes, setSelectedGroupes, "Groupes Alimentaires")}
        {renderMultiSelect(nutrimentsOptions, selectedNutriments, setSelectedNutriments, "Nutriments")}
        {renderMultiSelect(conditionsOptions, selectedRecommandations, setSelectedRecommandations, "Recommandé pour")}
        {renderMultiSelect(conditionsOptions, selectedContreIndications, setSelectedContreIndications, "Contre-indiqué pour")}

        {/* Checkboxes pour les sous-classes */}
        <div className="form-row">
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.est_riche_en_fibres}
                onChange={(e) => setFormData({...formData, est_riche_en_fibres: e.target.checked})}
              />
              🥬 Riche en fibres
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.est_index_glycemique_eleve}
                onChange={(e) => setFormData({...formData, est_index_glycemique_eleve: e.target.checked})}
              />
              📈 Index glycémique élevé
            </label>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={!formData.nom}>
          🍎 Créer l'Aliment
        </button>
      </form>

      {/* Liste des aliments */}
      <div className="crud-list">
        <div className="list-header">
          <h3>📋 Liste des Aliments ({uniqueAliments.length})</h3>
          <button onClick={loadAliments} className="btn-secondary">
            🔄 Actualiser
          </button>
        </div>

        {loading ? (
          <div className="loading">⏳ Chargement des aliments...</div>
        ) : (
          <div className="cards-container">
            {uniqueAliments.map((aliment, index) => (
              <div key={index} className="card aliment-card">
                <div className="card-header">
                  <strong>🍎 {aliment.nom}</strong>
                </div>
                <div className="card-body">
                  <p>🔥 Calories: {aliment.calories}</p>
                  <p>📊 IG: {aliment.indexGlycémique}</p>
                  {aliment.groupes.length > 0 && (
                    <p>📁 Groupes: {aliment.groupes.join(', ')}</p>
                  )}
                  {aliment.nutriments.length > 0 && (
                    <p>💊 Nutriments: {aliment.nutriments.join(', ')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {uniqueAliments.length === 0 && !loading && (
          <div className="no-data">
            <p>📭 Aucun aliment trouvé dans la base de données</p>
            <p className="hint">Créez votre premier aliment avec le formulaire ci-dessus</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlimentCRUD;