import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>Bienvenue sur la plateforme de recommandations nutritionnelles sémantiques</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Découvrez une nouvelle façon d'explorer la nutrition grâce à notre ontologie OWL 
          et nos capacités de recherche sémantique SPARQL.
        </p>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div className="card" style={{ background: '#e3f2fd' }}>
            <h3>📊 Catalogue d'aliments</h3>
            <p>Explorez notre base de données d'aliments avec leurs valeurs nutritionnelles complètes.</p>
            <Link to="/catalog">
              <button style={{ marginTop: '1rem' }}>Voir le catalogue</button>
            </Link>
          </div>
          
          <div className="card" style={{ background: '#f3e5f5' }}>
            <h3>🍳 Recettes</h3>
            <p>Découvrez des recettes adaptées à vos besoins nutritionnels et vos objectifs.</p>
            <Link to="/recettes">
              <button style={{ marginTop: '1rem' }}>Voir les recettes</button>
            </Link>
          </div>
          
          <div className="card" style={{ background: '#e8f5e9' }}>
            <h3>🔍 Recherche Sémantique</h3>
            <p>Utilisez le langage naturel ou SPARQL pour interroger notre ontologie nutritionnelle.</p>
            <Link to="/search">
              <button style={{ marginTop: '1rem' }}>Rechercher</button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ background: '#fff3e0' }}>
        <h2>Comment ça fonctionne ?</h2>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h4>1. Ontologie OWL</h4>
            <p>Notre base de connaissances est structurée avec une ontologie OWL comprenant des classes comme Aliment, Nutriment, Recette, Allergie, et Objectif.</p>
          </div>
          <div>
            <h4>2. Requêtes SPARQL</h4>
            <p>Interrogez directement l'ontologie avec des requêtes SPARQL pour des analyses complexes.</p>
          </div>
          <div>
            <h4>3. Recherche en langage naturel</h4>
            <p>Posez des questions en français : "Quels sont les aliments riches en protéines ?" et obtenez des résultats sémantiques.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
