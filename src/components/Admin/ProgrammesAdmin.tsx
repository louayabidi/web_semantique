import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProgrammesAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('programmes_bien_etre').select('*, objectifs(nom)').order('nom');
    setItems(data || []);
    setLoading(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Programmes de Bien-être ({items.length})</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 hover:border-green-300 transition-colors">
            <h3 className="font-semibold text-lg text-gray-800">{item.nom}</h3>
            {item.objectifs && (
              <p className="text-sm text-green-600 mt-1">Objectif: {item.objectifs.nom}</p>
            )}
            <p className="text-sm text-gray-600 mt-2">{item.description}</p>
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {item.duree_semaines} semaines
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
