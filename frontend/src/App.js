import React, { useState } from 'react';
import Navbar from './components/Navbar';
import PersonneCRUD from './components/PersonneCRUD';
import AlimentCRUD from './components/AlimentCRUD';
import SearchSemantic from './components/SearchSemantic';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('accueil');

  const renderContent = () => {
    switch (currentView) {
      case 'personnes':
        return <PersonneCRUD />;
      case 'aliments':
        return <AlimentCRUD />;
      case 'recherche':
        return <SearchSemantic />;
      default:
        return (
          <div className="accueil">
            <h1>🍎 Bienvenue sur Nutrition Sémantique</h1>
            <p>Une application intelligente pour la gestion nutritionnelle basée sur l'ontologie sémantique.</p>
            
            <div className="features">
              <div className="feature-card">
                <h3>👥 Gestion des Personnes</h3>
                <p>Créez et gérez les profils des utilisateurs avec leurs caractéristiques santé.</p>
              </div>
              
              <div className="feature-card">
                <h3>🍎 Base d'Aliments</h3>
                <p>Consultez et ajoutez des aliments avec leurs informations nutritionnelles.</p>
              </div>
              
              <div className="feature-card">
                <h3>🔍 Recherche Intelligente</h3>
                <p>Posez des questions en français et obtenez des réponses pertinentes grâce à l'IA.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;