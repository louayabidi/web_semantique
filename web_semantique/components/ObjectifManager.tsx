"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Objectif {
  id: { value: string }
  nom: { value: string }
}

export default function ObjectifManager() {
  const [open, setOpen] = useState(false)
  const [objectifs, setObjectifs] = useState<Objectif[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ nom: "" })
  const [selected, setSelected] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

  useEffect(() => {
    fetchObjectifs()
  }, [])

  const fetchObjectifs = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/objectifs")
      const data = await response.json()
      console.log("[v0] Objectifs fetched:", data)
      setObjectifs(data)
    } catch (error) {
      console.error("[v0] Error fetching objectifs:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5000/api/objectifs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ nom: "" })
        fetchObjectifs()
      } else {
        const error = await response.json()
        console.error("[v0] Error:", error)
      }
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
    }
  }

  const handleEdit = (id: string, currentName: string) => {
    setSelected(id)
    setNewName(currentName)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/objectifs/${id}`, {
        method: "DELETE",
      })
      fetchObjectifs()
    } catch (error) {
      console.error("[v0] Error deleting objectif:", error)
    }
  }

const handleSave = async () => {
  if (!selected) return
  try {
    console.log("[DEBUG] Payload envoyé:", { nom: newName })

    const res = await fetch(`http://localhost:5000/api/objectifs/${selected}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: newName }),
    })

    const data = await res.json() // récupère le JSON
    console.log("[DEBUG] Response JSON:", data) // => {success: true, error: ""}

    if (data.success) {
      setOpen(false)
      fetchObjectifs() // rafraîchit la liste
    } else {
      alert("Erreur: " + data.error)
    }
  } catch (err) {
    console.error("[DEBUG] Error:", err)
    alert("Erreur lors de la requête")
  }
}



  return (
    <div className="space-y-6">
      {/* === Add Objectif Form === */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Objectif</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom de l'Objectif</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                placeholder="Ex: Perdre du poids"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Objectif
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* === List of Objectifs === */}
      <Card>
        <CardHeader>
          <CardTitle>Objectifs ({objectifs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Chargement...</p>
          ) : objectifs.length === 0 ? (
            <p className="text-slate-500">Aucun objectif trouvé</p>
          ) : (
            <div className="space-y-2">
              {objectifs.map((o) => (
                <div
                  key={o.id.value}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                >
                  <p className="font-semibold">{o.nom.value}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(o.id.value, o.nom.value)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(o.id.value)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Edit Dialog === */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l’Objectif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="editName">Nom de l’Objectif</Label>
            <Input
              id="editName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Modifier le nom..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
