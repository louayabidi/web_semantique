import { useState, useEffect } from 'react';
import { User, Plus, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ProfileManager() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    age: '',
    poids: '',
    taille: '',
    sexe: 'homme',
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const { data, error } = await supabase.from('personne').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setProfiles(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const profile = {
      nom: formData.nom,
      prenom: formData.prenom,
      age: formData.age ? parseInt(formData.age) : null,
      poids: formData.poids ? parseFloat(formData.poids) : null,
      taille: formData.taille ? parseFloat(formData.taille) : null,
      sexe: formData.sexe,
    };

    const { error } = await supabase.from('personne').insert([profile]);

    if (!error) {
      setShowForm(false);
      setFormData({ nom: '', prenom: '', age: '', poids: '', taille: '', sexe: 'homme' });
      loadProfiles();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Gestion des Profils
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annuler' : 'Nouveau Profil'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Âge
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poids (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.poids}
                onChange={(e) => setFormData({ ...formData, poids: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taille (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.taille}
                onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexe
              </label>
              <select
                value={formData.sexe}
                onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {profile.prenom[0]}{profile.nom[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {profile.prenom} {profile.nom}
                  </h3>
                  <p className="text-xs text-gray-500">{profile.sexe}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              {profile.age && <p>Âge: {profile.age} ans</p>}
              {profile.poids && <p>Poids: {profile.poids} kg</p>}
              {profile.taille && <p>Taille: {profile.taille} cm</p>}
              {profile.poids && profile.taille && (
                <p className="text-xs text-gray-500 mt-2">
                  IMC: {(profile.poids / Math.pow(profile.taille / 100, 2)).toFixed(1)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {profiles.length === 0 && !showForm && (
        <div className="text-center text-gray-500 py-12">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun profil créé. Créez votre premier profil!</p>
        </div>
      )}
    </div>
  );
}
