"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 ,Edit2} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"

interface Recette {
  id: { value: string }
  nom: { value: string }
  description?: { value: string }
  tempsPréparation?: { value: string }
  niveauDifficulté?: { value: string }
}

export default function RecetteManager() {

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [recettes, setRecettes] = useState<Recette[]>([])
  const [newTemps, setNewTemps] = useState("")
  const [newNiveau, setNewNiveau] = useState("")

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
  const handleEdit = (id: string, currentName: string) => {
    setSelected(id)
    setNewName(currentName)
    setOpen(true)
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
                <Label htmlFor="niveauDifficulté">Niveau Difficulté</Label>
                <Input
                  id="niveauDifficulté"
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
  <React.Fragment key={r.id.value}>
    <div className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
      <div className="flex-1">
        <p className="font-semibold">{r.nom.value}</p>
        {r.description && <p className="text-sm text-slate-600">{r.description.value}</p>}
        <div className="flex gap-4 text-xs text-slate-500 mt-1">
          {r["tempsPréparation"] && <span>⏱️ {r["tempsPréparation"].value} min</span>}
          {r["niveauDifficulté"] && <span>📊 {r["niveauDifficulté"].value}</span>}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleEdit(r.id.value, r.nom.value)}
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id.value)}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Éditer la Recette</DialogTitle>
          <DialogDescription>Modifiez le nom de la recette ci-dessous.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom de la Recette</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <Label htmlFor="temps">Temps Préparation (min)</Label>
            <Input
              id="temps"
              value={newTemps}
              onChange={(e) => setNewTemps(e.target.value)}
            />
            <Label htmlFor="niveauDifficulté">Niveau Difficulté</Label>
            <Input
              id="niveauDifficulté"
              value={newNiveau}
              onChange={(e) => setNewNiveau(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              try {
                const response = await fetch(`http://localhost:5000/api/recettes/${selected}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ nom: newName, description: newDescription, tempsPréparation: newTemps, niveauDifficulté: newNiveau }),
                })
                if (response.ok) {
                  setOpen(false)
                  fetchRecettes()
                }
              } catch (error) {
                console.error("Error updating recette:", error)
              }
            }}
          >
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </React.Fragment>
))}

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
