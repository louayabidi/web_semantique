const API_URL = 'http://localhost:8000';

export interface SearchQuery {
  query: string;
  type: string;
}

export interface SPARQLQuery {
  query: string;
}

export interface Recommendation {
  aliments: any[];
  activites: any[];
  raison: string;
}

export const api = {
  async searchSemantic(query: string, type: string) {
    const response = await fetch(`${API_URL}/search/semantic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, type }),
    });
    return response.json();
  },

  async getAliments() {
    const response = await fetch(`${API_URL}/aliments`);
    return response.json();
  },

  async getActivites() {
    const response = await fetch(`${API_URL}/activites`);
    return response.json();
  },

  async getRecommendations(personneId: string) {
    const response = await fetch(`${API_URL}/recommendations/${personneId}`, {
      method: 'POST',
    });
    return response.json();
  },

  async executeSPARQL(query: string) {
    const response = await fetch(`${API_URL}/sparql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    return response.json();
  },

  async getOntology() {
    const response = await fetch(`${API_URL}/ontology`);
    return response.json();
  },
};
