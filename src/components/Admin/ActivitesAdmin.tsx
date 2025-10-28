import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Activite {
  id: string;
  nom: string;
  type_activite: string | null;
  duree_activite: number | null;
  niveau_difficulte: string | null;
  calories_brulees: number | null;
  description: string | null;
}

export default function ActivitesAdmin() {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Activite>>({});

  useEffect(() => {
    fetchActivites();
  }, []);

  const fetchActivites = async () => {
    try {
      const { data, error } = await supabase
        .from('activites_physiques')
        .select('*')
        .order('nom');
      if (error) throw error;
      setActivites(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (creating) {
        const { error } = await supabase.from('activites_physiques').insert([formData]);
        if (error) throw error;
      } else if (editing) {
        const { error } = await supabase.from('activites_physiques').update(formData).eq('id', editing);
        if (error) throw error;
      }
      await fetchActivites();
      setCreating(false);
      setEditing(null);
      setFormData({});
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmer la suppression ?')) return;
    try {
      const { error } = await supabase.from('activites_physiques').delete().eq('id', id);
      if (error) throw error;
      await fetchActivites();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Activités Physiques</h2>
        {!creating && !editing && (
          <button
            onClick={() => { setCreating(true); setFormData({ nom: '', type_activite: 'Cardio' }); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        )}
      </div>

      {(creating || editing) && (
        <div className="bg-gray-50 border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{creating ? 'Nouvelle Activité' : 'Modifier l\'Activité'}</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                value={formData.nom || ''}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type_activite || ''}
                onChange={(e) => setFormData({ ...formData, type_activite: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Cardio">Cardio</option>
                <option value="Musculation">Musculation</option>
                <option value="Yoga">Yoga</option>
                <option value="Fitness">Fitness</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Durée (minutes)</label>
              <input
                type="number"
                value={formData.duree_activite || ''}
                onChange={(e) => setFormData({ ...formData, duree_activite: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Niveau</label>
              <select
                value={formData.niveau_difficulte || ''}
                onChange={(e) => setFormData({ ...formData, niveau_difficulte: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Facile">Facile</option>
                <option value="Moyen">Moyen</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Calories brûlées</label>
              <input
                type="number"
                value={formData.calories_brulees || ''}
                onChange={(e) => setFormData({ ...formData, calories_brulees: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              <Save className="w-4 h-4" />Enregistrer
            </button>
            <button onClick={() => { setCreating(false); setEditing(null); setFormData({}); }} className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg">
              <X className="w-4 h-4" />Annuler
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold">Nom</th>
              <th className="text-left py-3 px-4 font-semibold">Type</th>
              <th className="text-left py-3 px-4 font-semibold">Durée</th>
              <th className="text-left py-3 px-4 font-semibold">Niveau</th>
              <th className="text-left py-3 px-4 font-semibold">Calories</th>
              <th className="text-right py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activites.map((act) => (
              <tr key={act.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{act.nom}</td>
                <td className="py-3 px-4">{act.type_activite}</td>
                <td className="py-3 px-4">{act.duree_activite} min</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    act.niveau_difficulte === 'Facile' ? 'bg-green-100 text-green-700' :
                    act.niveau_difficulte === 'Moyen' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {act.niveau_difficulte}
                  </span>
                </td>
                <td className="py-3 px-4">{act.calories_brulees} kcal</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditing(act.id); setFormData(act); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(act.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
