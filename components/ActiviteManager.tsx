"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit2, Plus } from "lucide-react"

interface Activite {
  id: { value: string }
  nom: { value: string }
  dureeActivite: { value: string }
  type?: { value: string }
}

export default function ActiviteManager() {
  const [activites, setActivites] = useState<Activite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nom: "",
    dureeActivite: "",
    type: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchActivites()
  }, [])

  const fetchActivites = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:5000/api/activites")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setActivites(data)
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
      const url = editingId ? `http://localhost:5000/api/activites/${editingId}` : "http://localhost:5000/api/activites"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          dureeActivite: Number.parseInt(formData.dureeActivite),
          type: formData.type || undefined,
        }),
      })

      if (response.ok) {
        setFormData({ nom: "", dureeActivite: "", type: "" })
        setEditingId(null)
        fetchActivites()
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
      const response = await fetch(`http://localhost:5000/api/activites/${id}`, { method: "DELETE" })
      if (response.ok) fetchActivites()
    } catch (error) {
      setError(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const handleEdit = (activite: Activite) => {
    setFormData({
      nom: activite.nom.value,
      dureeActivite: activite.dureeActivite.value,
      type: activite.type?.value || "",
    })
    setEditingId(activite.id.value)
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Ajouter/Modifier une Activité Physique</CardTitle>
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
                <Label htmlFor="dureeActivite">Durée (minutes)</Label>
                <Input
                  id="dureeActivite"
                  type="number"
                  value={formData.dureeActivite}
                  onChange={(e) => setFormData({ ...formData, dureeActivite: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="ex: Cardio, Musculation, Yoga"
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
          <CardTitle>Liste des Activités</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : activites.length === 0 ? (
            <p className="text-slate-500">Aucune activité trouvée</p>
          ) : (
            <div className="space-y-2">
              {activites.map((activite) => (
                <div key={activite.id.value} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{activite.nom.value}</p>
                    <p className="text-sm text-slate-600">
                      {activite.dureeActivite.value} minutes {activite.type && `• ${activite.type.value}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(activite)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(activite.id.value)}>
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
