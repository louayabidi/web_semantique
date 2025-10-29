"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface Allergie {
  id: { value: string }
  nom: { value: string }
  typeAllergie: { value: string }
}

export default function AllergieManager() {
  const [allergies, setAllergies] = useState<Allergie[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    typeAllergie: "",
  })

  useEffect(() => {
    fetchAllergies()
  }, [])

  const fetchAllergies = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/allergies")
      const data = await response.json()
      console.log("[v0] Allergies fetched:", data)
      setAllergies(data)
    } catch (error) {
      console.error("[v0] Error fetching allergies:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5000/api/allergies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ nom: "", typeAllergie: "" })
        fetchAllergies()
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
      await fetch(`http://localhost:5000/api/allergies/${id}`, { method: "DELETE" })
      fetchAllergies()
    } catch (error) {
      console.error("[v0] Error deleting allergie:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une Allergie</CardTitle>
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
                  placeholder="Ex: Arachide"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.typeAllergie}
                  onChange={(e) => setFormData({ ...formData, typeAllergie: e.target.value })}
                  placeholder="Ex: Alimentaire"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Allergie
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allergies ({allergies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {allergies.length === 0 ? (
            <p className="text-slate-500">Aucune allergie trouvée</p>
          ) : (
            <div className="space-y-2">
              {allergies.map((a) => (
                <div key={a.id.value} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{a.nom.value}</p>
                    <p className="text-sm text-slate-600">{a.typeAllergie.value}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id.value)}>
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
