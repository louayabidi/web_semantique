import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Aliment {
  id: string;
  nom: string;
  calories: number;
  index_glycemique: number | null;
  riche_en_fibres: boolean;
  description: string | null;
}

export default function AlimentsAdmin() {
  const [aliments, setAliments] = useState<Aliment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Aliment>>({});

  useEffect(() => {
    fetchAliments();
  }, []);

  const fetchAliments = async () => {
    try {
      const { data, error } = await supabase
        .from('aliments')
        .select('*')
        .order('nom');

      if (error) throw error;
      setAliments(data || []);
    } catch (error) {
      console.error('Error fetching aliments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCreating(true);
    setFormData({ nom: '', calories: 0, riche_en_fibres: false });
  };

  const handleEdit = (aliment: Aliment) => {
    setEditing(aliment.id);
    setFormData(aliment);
  };

  const handleSave = async () => {
    try {
      if (creating) {
        const { error } = await supabase
          .from('aliments')
          .insert([formData]);
        if (error) throw error;
      } else if (editing) {
        const { error } = await supabase
          .from('aliments')
          .update(formData)
          .eq('id', editing);
        if (error) throw error;
      }
      await fetchAliments();
      handleCancel();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet aliment ?')) return;

    try {
      const { error } = await supabase
        .from('aliments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchAliments();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleCancel = () => {
    setCreating(false);
    setEditing(null);
    setFormData({});
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Aliments</h2>
        {!creating && !editing && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un aliment
          </button>
        )}
      </div>

      {(creating || editing) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {creating ? 'Nouvel Aliment' : 'Modifier l\'Aliment'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={formData.nom || ''}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Nom de l'aliment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
              <input
                type="number"
                value={formData.calories || 0}
                onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Index Glycémique</label>
              <input
                type="number"
                value={formData.index_glycemique || ''}
                onChange={(e) => setFormData({ ...formData, index_glycemique: parseInt(e.target.value) || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.riche_en_fibres || false}
                  onChange={(e) => setFormData({ ...formData, riche_en_fibres: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Riche en fibres</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Description de l'aliment"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Calories</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">IG</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Fibres</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {aliments.map((aliment) => (
              <tr key={aliment.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800">{aliment.nom}</td>
                <td className="py-3 px-4 text-gray-600">{aliment.calories} kcal</td>
                <td className="py-3 px-4 text-gray-600">{aliment.index_glycemique || '-'}</td>
                <td className="py-3 px-4">
                  {aliment.riche_en_fibres ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Oui</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Non</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(aliment)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(aliment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
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
