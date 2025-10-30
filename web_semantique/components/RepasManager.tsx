"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2,Edit2 } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"

interface Repas {
  id: { value: string }
  nom: { value: string }
  type?: { value: string }
}

export default function RepasManager() {
  
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState("")

  const [repas, setRepas] = useState<Repas[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    type: "",
  })

  useEffect(() => {
    fetchRepas()
  }, [])

  const fetchRepas = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/repas")
      const data = await response.json()
      console.log("[v0] Repas fetched:", data)
      setRepas(data)
    } catch (error) {
      console.error("[v0] Error fetching repas:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5000/api/repas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ nom: "", type: "" })
        fetchRepas()
      } else {
        const error = await response.json()
        console.error("[v0] Error:", error)
      }
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
    }
  }
  const handleEdit = async (id: string, newName: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/repas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: newName, type: newType }),
      })
      if (response.ok) {
        fetchRepas()
      }
    } catch (error) {
      console.error("[v0] Error editing repas:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/repas/${id}`, { method: "DELETE" })
      fetchRepas()
    } catch (error) {
      console.error("[v0] Error deleting repas:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Repas</CardTitle>
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
                  placeholder="Ex: Petit-déjeuner"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ex: Matin"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Repas
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Repas ({repas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {repas.length === 0 ? (
            <p className="text-slate-500">Aucun repas trouvé</p>
          ) : (
            <div className="space-y-2">
              {repas.map((r) => (
  <React.Fragment key={r.id.value}>
    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
      <div>
        <p className="font-semibold">{r.nom.value}</p>
        {r.type && <p className="text-sm text-slate-600">{r.type.value}</p>}
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelected(r.id.value)
            setNewName(r.nom.value)
            setOpen(true)
          }}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id.value)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </React.Fragment>
))}

{/* Dialog hors du map, unique pour tous les repas */}
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Éditer le Repas</DialogTitle>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nom du Repas</Label>
        <Input
          id="name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Label htmlFor="type">Type du Repas</Label>
        <Input
          id="type"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
        />
      </div>
    </div>
    <DialogFooter>
      <Button
        onClick={() => {
          if (selected && newName.trim() !== "") {
            handleEdit(selected, newName)
            setOpen(false)
            setSelected(null)
            setNewName("")
          }
        }}
      >
        Sauvegarder
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


                
                
                
                
                

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
