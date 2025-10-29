"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit2, Plus } from "lucide-react"

interface Aliment {
  id: { value: string }
  nom: { value: string }
  calories: { value: string }
  indexGlycémique: { value: string }
  teneurFibres?: { value: string }
  teneurSodium?: { value: string }
}

export default function AlimentManager() {
  const [aliments, setAliments] = useState<Aliment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nom: "",
    calories: "",
    indexGlycémique: "",
    teneurFibres: "",
    teneurSodium: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAliments()
  }, [])

  const fetchAliments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:5000/api/aliments")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setAliments(data)
    } catch (error) {
      setError(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `http://localhost:5000/api/aliments/${editingId}` : "http://localhost:5000/api/aliments"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          calories: Number.parseInt(formData.calories),
          indexGlycémique: Number.parseInt(formData.indexGlycémique),
          teneurFibres: formData.teneurFibres ? Number.parseFloat(formData.teneurFibres) : undefined,
          teneurSodium: formData.teneurSodium ? Number.parseFloat(formData.teneurSodium) : undefined,
        }),
      })

      if (response.ok) {
        setFormData({ nom: "", calories: "", indexGlycémique: "", teneurFibres: "", teneurSodium: "" })
        setEditingId(null)
        fetchAliments()
      } else {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData))
      }
    } catch (error) {
      setError(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/aliments/${id}`, { method: "DELETE" })
      if (response.ok) fetchAliments()
    } catch (error) {
      setError(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const handleEdit = (aliment: Aliment) => {
    setFormData({
      nom: aliment.nom.value,
      calories: aliment.calories.value,
      indexGlycémique: aliment.indexGlycémique.value,
      teneurFibres: aliment.teneurFibres?.value || "",
      teneurSodium: aliment.teneurSodium?.value || "",
    })
    setEditingId(aliment.id.value)
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Ajouter/Modifier un Aliment</CardTitle>
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="indexGlycémique">Index Glycémique</Label>
                <Input
                  id="indexGlycémique"
                  type="number"
                  value={formData.indexGlycémique}
                  onChange={(e) => setFormData({ ...formData, indexGlycémique: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="teneurFibres">Teneur Fibres (g)</Label>
                <Input
                  id="teneurFibres"
                  type="number"
                  step="0.1"
                  value={formData.teneurFibres}
                  onChange={(e) => setFormData({ ...formData, teneurFibres: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="teneurSodium">Teneur Sodium (mg)</Label>
                <Input
                  id="teneurSodium"
                  type="number"
                  step="0.1"
                  value={formData.teneurSodium}
                  onChange={(e) => setFormData({ ...formData, teneurSodium: e.target.value })}
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
          <CardTitle>Liste des Aliments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : aliments.length === 0 ? (
            <p className="text-slate-500">Aucun aliment trouvé</p>
          ) : (
            <div className="space-y-2">
              {aliments.map((aliment) => (
                <div key={aliment.id.value} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{aliment.nom.value}</p>
                    <p className="text-sm text-slate-600">
                      {aliment.calories.value} cal • IG: {aliment.indexGlycémique.value}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(aliment)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(aliment.id.value)}>
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
