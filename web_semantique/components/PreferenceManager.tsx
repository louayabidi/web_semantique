"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface Preference {
  id: { value: string }
  nom: { value: string }
}

export default function PreferenceManager() {
  const [preferences, setPreferences] = useState<Preference[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ nom: "" })

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/preferences")
      const data = await response.json()
      console.log("[v0] Preferences fetched:", data)
      setPreferences(data)
    } catch (error) {
      console.error("[v0] Error fetching preferences:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5000/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ nom: "" })
        fetchPreferences()
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
      await fetch(`http://localhost:5000/api/preferences/${id}`, { method: "DELETE" })
      fetchPreferences()
    } catch (error) {
      console.error("[v0] Error deleting preference:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une Préférence Alimentaire</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom de la Préférence</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ nom: e.target.value })}
                placeholder="Ex: Végétarien"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Préférence
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Préférences Alimentaires ({preferences.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {preferences.length === 0 ? (
            <p className="text-slate-500">Aucune préférence trouvée</p>
          ) : (
            <div className="space-y-2">
              {preferences.map((p) => (
                <div key={p.id.value} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">{p.nom.value}</p>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id.value)}>
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
