import { useState } from 'react';
import { Settings, Apple, Activity, Heart, Users, AlertCircle, Star } from 'lucide-react';
import AlimentsAdmin from '../components/Admin/AlimentsAdmin';
import ActivitesAdmin from '../components/Admin/ActivitesAdmin';
import NutrimentsAdmin from '../components/Admin/NutrimentsAdmin';
import ConditionsAdmin from '../components/Admin/ConditionsAdmin';
import ProgrammesAdmin from '../components/Admin/ProgrammesAdmin';

type AdminSection = 'aliments' | 'activites' | 'nutriments' | 'conditions' | 'programmes';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('aliments');

  const sections = [
    { id: 'aliments' as AdminSection, label: 'Aliments', icon: Apple, color: 'green' },
    { id: 'activites' as AdminSection, label: 'Activités', icon: Activity, color: 'blue' },
    { id: 'nutriments' as AdminSection, label: 'Nutriments', icon: Star, color: 'yellow' },
    { id: 'conditions' as AdminSection, label: 'Conditions', icon: AlertCircle, color: 'red' },
    { id: 'programmes' as AdminSection, label: 'Programmes', icon: Heart, color: 'pink' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-gray-700" />
            <h1 className="text-4xl font-bold text-gray-800">Administration</h1>
          </div>
          <p className="text-gray-600">Gérer les données de la plateforme NutriSmart</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-b-2 border-green-600 text-green-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {section.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeSection === 'aliments' && <AlimentsAdmin />}
            {activeSection === 'activites' && <ActivitesAdmin />}
            {activeSection === 'nutriments' && <NutrimentsAdmin />}
            {activeSection === 'conditions' && <ConditionsAdmin />}
            {activeSection === 'programmes' && <ProgrammesAdmin />}
          </div>
        </div>
      </div>
    </div>
  );
}
