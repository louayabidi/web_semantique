import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="nav">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          🍎 Nutrition Sémantique
        </Link>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/">Accueil</Link>
        <Link to="/catalog">Catalogue</Link>
        <Link to="/recettes">Recettes</Link>
        <Link to="/search">Recherche Sémantique</Link>
        
        {user ? (
          <>
            {isAdmin && <Link to="/admin">Admin</Link>}
            <span style={{ color: '#4CAF50' }}>
              {user.username} {isAdmin && '(Admin)'}
            </span>
            <button onClick={handleLogout} className="btn-secondary">
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
