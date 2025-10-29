"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface Condition {
  id: { value: string }
  nom: { value: string }
}

export default function ConditionManager() {
  const [conditions, setConditions] = useState<Condition[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ nom: "" })

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
    try {
      const response = await fetch("http://localhost:5000/api/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ nom: "" })
        fetchConditions()
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
      await fetch(`http://localhost:5000/api/conditions/${id}`, { method: "DELETE" })
      fetchConditions()
    } catch (error) {
      console.error("[v0] Error deleting condition:", error)
    }
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
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Condition
            </Button>
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
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id.value)}>
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
