import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const api = {
  // Personnes
  getPersonnes: () => axios.get(`${API_BASE}/personnes`),
  createPersonne: (data) => axios.post(`${API_BASE}/personnes`, data),
  updatePersonne: (id, data) => axios.put(`${API_BASE}/personnes/${id}`, data),
  deletePersonne: (id) => axios.delete(`${API_BASE}/personnes/${id}`),
  
  // Aliments
  getAliments: () => axios.get(`${API_BASE}/aliments`),
  createAliment: (data) => axios.post(`${API_BASE}/aliments`, data),
  
  // Recherche sémantique
  rechercheSemantique: (question) => 
    axios.post(`${API_BASE}/recherche`, { question })
};