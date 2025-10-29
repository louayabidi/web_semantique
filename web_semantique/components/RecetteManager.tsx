"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"

interface Recette {
  id: { value: string }
  nom: { value: string }
  description?: { value: string }
  tempsPréparation?: { value: string }
  niveauDifficulté?: { value: string }
}

export default function RecetteManager() {
  const [recettes, setRecettes] = useState<Recette[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    tempsPréparation: "",
    niveauDifficulté: "",
  })

  useEffect(() => {
    fetchRecettes()
  }, [])

  const fetchRecettes = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/recettes")
      const data = await response.json()
      console.log("[v0] Recettes fetched:", data)
      setRecettes(data)
    } catch (error) {
      console.error("[v0] Error fetching recettes:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5000/api/recettes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ nom: "", description: "", tempsPréparation: "", niveauDifficulté: "" })
        fetchRecettes()
      } else {
        const error = await response.json()
        console.error("[v0] Error:", error)
      }
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/recettes/${id}`, { method: "DELETE" })
      fetchRecettes()
    } catch (error) {
      console.error("[v0] Error deleting recette:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une Recette</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Salade Grecque"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la recette"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temps">Temps Préparation (min)</Label>
                <Input
                  id="temps"
                  type="number"
                  value={formData.tempsPréparation}
                  onChange={(e) => setFormData({ ...formData, tempsPréparation: e.target.value })}
                  placeholder="Ex: 30"
                />
              </div>
              <div>
                <Label htmlFor="niveau">Niveau Difficulté</Label>
                <Input
                  id="niveau"
                  value={formData.niveauDifficulté}
                  onChange={(e) => setFormData({ ...formData, niveauDifficulté: e.target.value })}
                  placeholder="Ex: Facile"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Recette
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recettes ({recettes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {recettes.length === 0 ? (
            <p className="text-slate-500">Aucune recette trouvée</p>
          ) : (
            <div className="space-y-2">
              {recettes.map((r) => (
                <div key={r.id.value} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{r.nom.value}</p>
                    {r.description && <p className="text-sm text-slate-600">{r.description.value}</p>}
                    <div className="flex gap-4 text-xs text-slate-500 mt-1">
                      {r["tempsPréparation"] && <span>⏱️ {r["tempsPréparation"].value} min</span>}
                      {r["niveauDifficulté"] && <span>📊 {r["niveauDifficulté"].value}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id.value)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
