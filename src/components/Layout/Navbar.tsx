import { Apple, LogOut, Home, Settings, Search, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { personne, signOut, isAdmin } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-gray-800 font-bold text-xl hover:text-green-600 transition-colors"
            >
              <Apple className="w-8 h-8 text-green-600" />
              NutriSmart
            </button>

            <div className="hidden md:flex gap-4">
              <button
                onClick={() => onNavigate('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'home'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                Accueil
              </button>

              <button
                onClick={() => onNavigate('search')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'search'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Search className="w-4 h-4" />
                Recherche
              </button>

              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'admin'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Administration
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{personne?.nom}</span>
              {isAdmin && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Admin
                </span>
              )}
            </button>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
