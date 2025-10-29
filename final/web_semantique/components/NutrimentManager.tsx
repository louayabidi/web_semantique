// components/NutrimentManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, AlertCircle, RefreshCw } from "lucide-react";

interface Nutriment {
  id: { value: string };
  nom: { value: string };
  unite?: { value: string };
  valeurPar100g?: { value: string };
}

export default function NutrimentManager() {
  const [nutriments, setNutriments] = useState<Nutriment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    unite: "mg",
    valeurPar100g: "",
  });

  const fetchNutriments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/api/nutriments");
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
      }

      const data = await res.json();
      const bindings = data.results?.bindings || [];
      setNutriments(bindings);
    } catch (err) {
      console.error("[NutrimentManager] Fetch error:", err);
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutriments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) return;

    try {
      setError(null);
      const payload: any = { nom: formData.nom };
      if (formData.unite) payload.unite = formData.unite;
      if (formData.valeurPar100g) payload.valeurPar100g = parseFloat(formData.valeurPar100g);

      const res = await fetch("http://localhost:5000/api/nutriments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      setFormData({ nom: "", unite: "mg", valeurPar100g: "" });
      fetchNutriments();
    } catch (err) {
      console.error("[NutrimentManager] Submit error:", err);
      setError(err instanceof Error ? err.message : "Échec envoi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce nutriment ?")) return;
    try {
      setError(null);
      const res = await fetch(`http://localhost:5000/api/nutriments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchNutriments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec suppression");
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ajouter un Nutriment</CardTitle>
          <Button size="sm" variant="outline" onClick={fetchNutriments}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Vitamine C"
                  required
                />
              </div>
              <div>
                <Label htmlFor="valeur">Valeur / 100g</Label>
                <Input
                  id="valeur"
                  type="number"
                  step="0.01"
                  value={formData.valeurPar100g}
                  onChange={(e) => setFormData({ ...formData, valeurPar100g: e.target.value })}
                  placeholder="90.5"
                />
              </div>
              <div>
                <Label htmlFor="unite">Unité</Label>
                <Input
                  id="unite"
                  value={formData.unite}
                  onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                  placeholder="mg"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Nutriment
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Liste */}
      <Card>
        <CardHeader>
          <CardTitle>
            Nutriments ({nutriments.length})
            {loading && <Loader2 className="inline-block w-4 h-4 ml-2 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nutriments.length === 0 && !loading ? (
            <p className="text-center text-slate-500 py-8">
              Aucun nutriment. Ajoutez-en un !
            </p>
          ) : (
            <div className="space-y-2">
              {nutriments.map((n) => (
                <div
                  key={n.id.value}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{n.nom.value}</p>
                    {n.valeurPar100g && (
                      <p className="text-sm text-slate-600">
                        {n.valeurPar100g.value} {n.unite?.value || ""} / 100g
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(n.id.value)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}