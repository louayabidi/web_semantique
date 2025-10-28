import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ConditionsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('conditions_medicales').select('*').order('nom');
    setItems(data || []);
    setLoading(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Conditions Médicales ({items.length})</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <h3 className="font-semibold text-gray-800">{item.nom}</h3>
            <p className="text-sm text-gray-600 mt-1">{item.type_condition}</p>
            {item.description && <p className="text-sm text-gray-500 mt-2">{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
