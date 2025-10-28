import React from 'react';
import './Navbar.css';

const Navbar = ({ currentView, setCurrentView }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>🍎 Nutrition Sémantique</h2>
      </div>
      <div className="navbar-menu">
        <button 
          className={currentView === 'accueil' ? 'active' : ''}
          onClick={() => setCurrentView('accueil')}
        >
          Accueil
        </button>
        <button 
          className={currentView === 'personnes' ? 'active' : ''}
          onClick={() => setCurrentView('personnes')}
        >
          Personnes
        </button>
        <button 
          className={currentView === 'aliments' ? 'active' : ''}
          onClick={() => setCurrentView('aliments')}
        >
          Aliments
        </button>
        <button 
          className={currentView === 'recherche' ? 'active' : ''}
          onClick={() => setCurrentView('recherche')}
        >
          Recherche
        </button>
      </div>
    </nav>
  );
};

export default Navbar;