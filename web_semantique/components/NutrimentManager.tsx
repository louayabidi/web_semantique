"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Plus, Trash2 } from "lucide-react"

interface Nutriment {
  id: { value: string }
  nom: { value: string }
  doseRecommandée: { value: string }
  unitéDose: { value: string }
}

export default function NutrimentManager() {
  const [nutriments, setNutriments] = useState<Nutriment[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    doseRecommandée: "",
    unitéDose: "mg",
  })
  const [editingId, setEditingId] = useState<string | null>(null)  
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    fetchNutriments()
  }, [])

  const fetchNutriments = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/nutriments")
      const data = await response.json()
      setNutriments(data)
    } catch (error) {
      console.error("[v0] Error fetching nutriments:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)  // reset error state
  try {
    const method = editingId ? "PUT" : "POST"
    const url = editingId
      ? `http://localhost:5000/api/nutriments/${editingId}`
      : "http://localhost:5000/api/nutriments"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: formData.nom,
        doseRecommandée: Number.parseFloat(formData.doseRecommandée),
        unitéDose: formData.unitéDose,
      }),
    })

    if (response.ok) {
      // Reset form and editingId
      setFormData({ nom: "", doseRecommandée: "", unitéDose: "mg" })
      setEditingId(null)
      fetchNutriments()
    } else {
      const errorData = await response.json()
      throw new Error(JSON.stringify(errorData))
    }
  } catch (error) {
    setError(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
  }
}


  const handleDelete = async (id: string) => {
    const rawId = id.replace(/^nutriment_/, "")
    try {
      await fetch(`http://localhost:5000/api/nutriments/${rawId}`, { method: "DELETE" })
      fetchNutriments()
    } catch (error) {
      console.error("[v0] Error deleting nutriment:", error)
    }
  }
  const handleEdit = (nutriment: Nutriment) => {
    setFormData({
      nom: nutriment.nom.value,
      doseRecommandée: nutriment.doseRecommandée.value,
      unitéDose: nutriment.unitéDose.value,
    })
    const rawId = nutriment.id.value.replace(/^nutriment_/, "")
    setEditingId(rawId)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Nutriment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Vitamine C"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dose">Dose Recommandée</Label>
                <Input
                  id="dose"
                  type="number"
                  step="0.1"
                  value={formData.doseRecommandée}
                  onChange={(e) => setFormData({ ...formData, doseRecommandée: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unite">Unité</Label>
                <Input
                  id="unite"
                  value={formData.unitéDose}
                  onChange={(e) => setFormData({ ...formData, unitéDose: e.target.value })}
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
          <CardTitle>Nutriments ({nutriments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {nutriments.length === 0 ? (
            <p className="text-slate-500">Aucun nutriment trouvé</p>
          ) : (
            <div className="space-y-2">
              {nutriments.map((n) => (
                <div key={n.id.value} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{n.nom.value}</p>
                    <p className="text-sm text-slate-600">
                      {n.doseRecommandée.value} {n.unitéDose.value}
                    </p>
                  </div>
                  <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(n)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(n.id.value)}>
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
