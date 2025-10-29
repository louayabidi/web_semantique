"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit2, Plus } from "lucide-react"

interface Personne {
  id: { value: string }
  nom: { value: string }
  âge: { value: string }
  poids: { value: string }
  taille: { value: string }
  objectifPoids?: { value: string }
}

export default function PersonneManager() {
  const [personnes, setPersonnes] = useState<Personne[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nom: "",
    age: "",
    poids: "",
    taille: "",
    objectifPoids: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPersonnes()
  }, [])

  const fetchPersonnes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:5000/api/personnes")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setPersonnes(data)
    } catch (error) {
      console.error("[v0] Error fetching personnes:", error)
      setError(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `http://localhost:5000/api/personnes/${editingId}` : "http://localhost:5000/api/personnes"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          âge: Number.parseInt(formData.age),
          poids: Number.parseFloat(formData.poids),
          taille: Number.parseFloat(formData.taille),
          objectifPoids: formData.objectifPoids ? Number.parseFloat(formData.objectifPoids) : undefined,
        }),
      })

      if (response.ok) {
        setFormData({ nom: "", age: "", poids: "", taille: "", objectifPoids: "" })
        setEditingId(null)
        fetchPersonnes()
      } else {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData))
      }
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
      setError(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const handleDelete = async (id: string) => {
  const rawId = id.replace(/^personne_/, "")
  try {
    const response = await fetch(`http://localhost:5000/api/personnes/${rawId}`, { method: "DELETE" })
    if (response.ok) fetchPersonnes()
  } catch (error) {
    console.error("[v0] Error deleting personne:", error)
  }
}

  const handleEdit = (personne: Personne) => {
  setFormData({
    nom: personne.nom.value,
    age: personne["âge"].value,
    poids: personne.poids.value,
    taille: personne.taille.value,
    objectifPoids: personne.objectifPoids?.value || "",
  })

  
  const rawId = personne.id.value.replace(/^personne_/, "")
  setEditingId(rawId)
}


  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Ajouter/Modifier une Personne</CardTitle>
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
                <Label htmlFor="age">Âge</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="poids">Poids (kg)</Label>
                <Input
                  id="poids"
                  type="number"
                  step="0.1"
                  value={formData.poids}
                  onChange={(e) => setFormData({ ...formData, poids: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="taille">Taille (m)</Label>
                <Input
                  id="taille"
                  type="number"
                  step="0.01"
                  value={formData.taille}
                  onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="objectifPoids">Objectif Poids (kg)</Label>
                <Input
                  id="objectifPoids"
                  type="number"
                  step="0.1"
                  value={formData.objectifPoids}
                  onChange={(e) => setFormData({ ...formData, objectifPoids: e.target.value })}
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
          <CardTitle>Liste des Personnes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : personnes.length === 0 ? (
            <p className="text-slate-500">Aucune personne trouvée</p>
          ) : (
            <div className="space-y-2">
              {personnes.map((personne) => (
                <div key={personne.id.value} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{personne.nom.value}</p>
                    <p className="text-sm text-slate-600">
                      {personne["âge"].value} ans • {personne.poids.value} kg • {personne.taille.value} m
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(personne)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(personne.id.value)}>
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
