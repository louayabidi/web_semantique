"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface Personne {
  id: { value: string }
  nom: { value: string }
}

interface Objectif {
  id: { value: string }
  nom: { value: string }
}

interface Programme {
  id: { value: string }
  personneId: { value: string }
  objectifId: { value: string }
  dateDebut?: { value: string }
  dateFin?: { value: string }
}

export default function ProgrammeManager() {
  const [personnes, setPersonnes] = useState<Personne[]>([])
  const [objectifs, setObjectifs] = useState<Objectif[]>([])
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    personneId: "",
    objectifId: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [personnesRes, objectifsRes, programmesRes] = await Promise.all([
        fetch("http://localhost:5000/api/personnes"),
        fetch("http://localhost:5000/api/objectifs"),
        fetch("http://localhost:5000/api/programmes"),
      ])

      setPersonnes(await personnesRes.json())
      setObjectifs(await objectifsRes.json())
      setProgrammes(await programmesRes.json())
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5000/api/programmes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ personneId: "", objectifId: "" })
        fetchData()
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
      await fetch(`http://localhost:5000/api/programmes/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("[v0] Error deleting programme:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Créer un Programme Bien-Être</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="personne">Personne</Label>
                <Select
                  value={formData.personneId}
                  onValueChange={(value) => setFormData({ ...formData, personneId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une personne" />
                  </SelectTrigger>
                  <SelectContent>
                    {personnes.map((p) => (
                      <SelectItem key={p.id.value} value={p.id.value}>
                        {p.nom.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="objectif">Objectif</Label>
                <Select
                  value={formData.objectifId}
                  onValueChange={(value) => setFormData({ ...formData, objectifId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un objectif" />
                  </SelectTrigger>
                  <SelectContent>
                    {objectifs.map((o) => (
                      <SelectItem key={o.id.value} value={o.id.value}>
                        {o.nom.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Créer Programme
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Programmes ({programmes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {programmes.length === 0 ? (
            <p className="text-slate-500">Aucun programme trouvé</p>
          ) : (
            <div className="space-y-2">
              {programmes.map((p) => (
                <div key={p.id.value} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Programme {p.id.value.substring(0, 8)}</p>
                    <p className="text-sm text-slate-600">Personne: {p.personneId.value}</p>
                    <p className="text-sm text-slate-600">Objectif: {p.objectifId.value}</p>
                  </div>
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
