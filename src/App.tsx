import { useState } from 'react';
import { Brain, Menu, X } from 'lucide-react';
import SemanticSearch from './components/SemanticSearch';
import SPARQLQuery from './components/SPARQLQuery';
import Recommendations from './components/Recommendations';
import ProfileManager from './components/ProfileManager';
import DataManager from './components/DataManager';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'search', label: 'Recherche Sémantique' },
    { id: 'sparql', label: 'Requêtes SPARQL' },
    { id: 'recommendations', label: 'Recommandations' },
    { id: 'profiles', label: 'Profils' },
    { id: 'data', label: 'Données' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Nutrition & Bien-être</h1>
                <p className="text-xs text-gray-500">Ontologie Sémantique</p>
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden md:flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMenuOpen(false);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">
              Plateforme de Recommandations Nutritionnelles
            </h2>
            <p className="text-blue-50">
              Utilisant une ontologie OWL et des requêtes SPARQL pour des recommandations personnalisées
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {activeTab === 'search' && <SemanticSearch />}
          {activeTab === 'sparql' && <SPARQLQuery />}
          {activeTab === 'recommendations' && <Recommendations />}
          {activeTab === 'profiles' && <ProfileManager />}
          {activeTab === 'data' && <DataManager />}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Application Web Full-Stack de Nutrition & Bien-être</p>
            <p className="mt-1">React + Python (FastAPI) + RDFLib + Supabase</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
