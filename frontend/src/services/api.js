import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

export const alimentsAPI = {
  getAll: (params) => api.get('/aliments', { params }),
  getById: (id) => api.get(`/aliments/${id}`),
  create: (data) => api.post('/aliments', data),
  update: (id, data) => api.put(`/aliments/${id}`, data),
  delete: (id) => api.delete(`/aliments/${id}`),
};

export const recettesAPI = {
  getAll: (params) => api.get('/recettes', { params }),
  getById: (id) => api.get(`/recettes/${id}`),
  create: (data) => api.post('/recettes', data),
  update: (id, data) => api.put(`/recettes/${id}`, data),
  delete: (id) => api.delete(`/recettes/${id}`),
};

export const semanticAPI = {
  sparqlQuery: (query) => api.post('/semantic/sparql', { query }),
  naturalLanguageSearch: (query) => api.post('/semantic/nl-search', { query }),
  getClasses: () => api.get('/semantic/ontology/classes'),
  getProperties: () => api.get('/semantic/ontology/properties'),
  getIndividuals: () => api.get('/semantic/ontology/individuals'),
};

export const entitiesAPI = {
  getNutriments: () => api.get('/nutriments'),
  createNutriment: (data) => api.post('/nutriments', data),
  getGroupes: () => api.get('/groupes-alimentaires'),
  createGroupe: (data) => api.post('/groupes-alimentaires', data),
  getAllergies: () => api.get('/allergies'),
  createAllergie: (data) => api.post('/allergies', data),
  getObjectifs: () => api.get('/objectifs'),
  createObjectif: (data) => api.post('/objectifs', data),
};

export default api;
