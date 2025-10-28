import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'search' && <SearchPage />}
      {currentPage === 'admin' && isAdmin && <AdminPage />}
      {currentPage === 'profile' && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Mon Profil</h2>
            <p className="text-gray-600">Page de profil en construction...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
