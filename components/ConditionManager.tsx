"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Plus, Trash2 } from "lucide-react"

interface Condition {
  id: { value: string }
  nom: { value: string }
}

export default function ConditionManager() {
  const [conditions, setConditions] = useState<Condition[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ nom: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConditions()
  }, [])

  const fetchConditions = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/conditions")
      const data = await response.json()
      console.log("[v0] Conditions fetched:", data)
      setConditions(data)
    } catch (error) {
      console.error("[v0] Error fetching conditions:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null) // optional: add an error state if needed

  try {
    // Determine method and URL based on editingId
    const method = editingId ? "PUT" : "POST"
    const url = editingId
      ? `http://localhost:5000/api/conditions/${editingId}`
      : "http://localhost:5000/api/conditions"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      // Reset form and editing state
      setFormData({ nom: "" })
      setEditingId(null)
      fetchConditions() // refresh list
    } else {
      const errorData = await response.json()
      console.error("[v0] Error submitting condition:", errorData)
    }
  } catch (error) {
    console.error("[v0] Error submitting condition:", error)
  }
}


  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/conditions/${id}`, { method: "DELETE" })
      fetchConditions()
    } catch (error) {
      console.error("[v0] Error deleting condition:", error)
    }
  }
  const handleEdit = (condition: Condition) => {
  setFormData({
    nom: condition.nom.value,
  })
  const rawId = condition.id.value.replace(/^condition_/, "")
    setEditingId(rawId)
}


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une Condition Médicale</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom de la Condition</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ nom: e.target.value })}
                placeholder="Ex: Diabète"
                required
              />
            </div>
            <div className="flex gap-2">
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? "Modifier" : "Ajouter"}
            </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conditions Médicales ({conditions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {conditions.length === 0 ? (
            <p className="text-slate-500">Aucune condition trouvée</p>
          ) : (
            <div className="space-y-2">
              {conditions.map((c) => (
                <div key={c.id.value} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">{c.nom.value}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(c)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id.value)}>
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
