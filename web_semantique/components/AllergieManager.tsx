"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Plus, Trash2 } from "lucide-react"

interface Allergie {
  id: { value: string }
  nom: { value: string }
  typeAllergie: { value: string }
}

export default function AllergieManager() {
  const [allergies, setAllergies] = useState<Allergie[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    typeAllergie: "",
  })
const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllergies()
  }, [])

  const fetchAllergies = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/allergies")
      const data = await response.json()
      console.log("[v0] Allergies fetched:", data)
      setAllergies(data)
    } catch (error) {
      console.error("[v0] Error fetching allergies:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:5000/api/allergies/${editingId}`
      : "http://localhost:5000/api/allergies";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: formData.nom,
        typeAllergie: formData.typeAllergie,
      }),
    });

    if (response.ok) {
      // Reset form and editing state
      setFormData({ nom: "", typeAllergie: "" });
      setEditingId(null);
      fetchAllergies(); // refresh list
    } else {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
  } catch (error) {
    console.error("[v0] Error submitting allergie:", error);
  }
};

  const handleDelete = async (id: string) => {
    const rawId = id.replace(/^allergie_/, "")
    try {
      await fetch(`http://localhost:5000/api/allergies/${rawId}`, { method: "DELETE" })
      fetchAllergies()
    } catch (error) {
      console.error("[v0] Error deleting allergie:", error)
    }
  }
  const handleEdit = (allergie: Allergie) => {
  setFormData({
    nom: allergie.nom.value,
    typeAllergie: allergie.typeAllergie.value,
  });

  // Remove prefix (like "allergie_") if your backend uses it
  const rawId = allergie.id.value.replace(/^allergie_/, "");
  setEditingId(rawId);
};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une Allergie</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Arachide"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.typeAllergie}
                  onChange={(e) => setFormData({ ...formData, typeAllergie: e.target.value })}
                  placeholder="Ex: Alimentaire"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          {editingId ? "Modifier" : "Ajouter"}
                        </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allergies ({allergies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {allergies.length === 0 ? (
            <p className="text-slate-500">Aucune allergie trouvée</p>
          ) : (
            <div className="space-y-2">
              {allergies.map((a) => (
                <div key={a.id.value} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{a.nom.value}</p>
                    <p className="text-sm text-slate-600">{a.typeAllergie.value}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(a)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id.value)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
