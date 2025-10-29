"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface Objectif {
  id: { value: string }
  nom: { value: string }
}

export default function ObjectifManager() {
  const [objectifs, setObjectifs] = useState<Objectif[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ nom: "" })

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

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/objectifs/${id}`, { method: "DELETE" })
      fetchObjectifs()
    } catch (error) {
      console.error("[v0] Error deleting objectif:", error)
    }
  }

  return (
    <div className="space-y-6">
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
                onChange={(e) => setFormData({ nom: e.target.value })}
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

      <Card>
        <CardHeader>
          <CardTitle>Objectifs ({objectifs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {objectifs.length === 0 ? (
            <p className="text-slate-500">Aucun objectif trouvé</p>
          ) : (
            <div className="space-y-2">
              {objectifs.map((o) => (
                <div key={o.id.value} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">{o.nom.value}</p>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(o.id.value)}>
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
