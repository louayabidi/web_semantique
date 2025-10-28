import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function NutrimentsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('nutriments').select('*').order('nom');
    setItems(data || []);
    setLoading(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Nutriments ({items.length})</h2>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
            <div>
              <h3 className="font-semibold">{item.nom}</h3>
              <p className="text-sm text-gray-600">Type: {item.type_nutriment} - Dose: {item.dose_recommandee} {item.unite_dose}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
