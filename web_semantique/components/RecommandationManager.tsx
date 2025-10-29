"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, RefreshCw } from "lucide-react"

interface Personne {
  id: { value: string }
  nom: { value: string }
}

interface Aliment {
  id: { value: string }
  nom: { value: string }
}

interface Activite {
  id: { value: string }
  nom: { value: string }
}

interface Recommandation {
  id: { value: string }
  personneId: { value: string }
  alimentId: { value: string }
  activiteId?: { value: string }
  dateCreation?: { value: string }
}

export default function RecommandationManager() {
  const [personnes, setPersonnes] = useState<Personne[]>([])
  const [aliments, setAliments] = useState<Aliment[]>([])
  const [activites, setActivites] = useState<Activite[]>([])
  const [recommandations, setRecommandations] = useState<Recommandation[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [formData, setFormData] = useState({
    personneId: "",
    alimentId: "",
    activiteId: "",
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    setDataLoaded(false)
    try {
      await Promise.all([
        fetchPersonnes(),
        fetchAliments(),
        fetchActivites(),
        fetchRecommandations()
      ])
      setDataLoaded(true)
    } catch (error) {
      console.error("Error fetching initial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPersonnes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/personnes")
      const data = await response.json()
      console.log("Personnes data:", data)
      setPersonnes(data || [])
    } catch (error) {
      console.error("Error fetching personnes:", error)
      setPersonnes([])
    }
  }

  const fetchAliments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/aliments")
      const data = await response.json()
      console.log("Aliments data:", data)
      setAliments(data || [])
    } catch (error) {
      console.error("Error fetching aliments:", error)
      setAliments([])
    }
  }

  const fetchActivites = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/activites")
      const data = await response.json()
      console.log("Activites data:", data)
      setActivites(data || [])
    } catch (error) {
      console.error("Error fetching activites:", error)
      setActivites([])
    }
  }

  const fetchRecommandations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/recommandations")
      const data = await response.json()
      console.log("Recommandations data:", data)
      setRecommandations(data || [])
    } catch (error) {
      console.error("Error fetching recommandations:", error)
      setRecommandations([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.personneId || !formData.alimentId) {
      alert("Veuillez sélectionner une personne et un aliment")
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/recommandations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personneId: formData.personneId,
          alimentId: formData.alimentId,
          activiteId: formData.activiteId || undefined,
        }),
      })

      if (response.ok) {
        setFormData({ personneId: "", alimentId: "", activiteId: "" })
        fetchRecommandations()
      } else {
        const errorData = await response.json()
        console.error("Error creating recommandation:", errorData)
        alert("Erreur lors de la création: " + JSON.stringify(errorData))
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Erreur réseau lors de la création")
    }
  }

  // Fonction pour normaliser les IDs
  const normalizeId = (id: string): string => {
    if (!id) return ""
    
    // Supprimer les préfixes répétés
    const prefixes = ['personne_personne_personne_', 'aliment_aliment_aliment_', 'activite_activite_activite_', 'personne_personne_', 'aliment_aliment_', 'activite_activite_']
    
    for (const prefix of prefixes) {
      if (id.includes(prefix)) {
        // Garder seulement le dernier préfixe
        const parts = prefix.split('_').filter(p => p)
        const lastPrefix = parts[parts.length - 1] + '_'
        return id.replace(prefix, lastPrefix)
      }
    }
    
    return id
  }

  // Fonctions de helper pour récupérer les noms avec IDs normalisés
  const getAlimentName = (alimentId: string) => {
    if (!alimentId) return "Aliment inconnu"
    const normalizedId = normalizeId(alimentId)
    const aliment = aliments.find(a => normalizeId(a.id.value) === normalizedId)
    return aliment ? aliment.nom.value : `Aliment inconnu (${normalizedId})`
  }

  const getActiviteName = (activiteId?: string) => {
    if (!activiteId) return null
    const normalizedId = normalizeId(activiteId)
    const activite = activites.find(a => normalizeId(a.id.value) === normalizedId)
    return activite ? activite.nom.value : `Activité inconnue (${normalizedId})`
  }

  const getPersonneName = (personneId: string) => {
    if (!personneId) return "Personne inconnue"
    const normalizedId = normalizeId(personneId)
    const personne = personnes.find(p => normalizeId(p.id.value) === normalizedId)
    return personne ? personne.nom.value : `Personne inconnue (${normalizedId})`
  }

  // Fonction pour afficher une recommandation de manière sécurisée
  const renderRecommandation = (rec: Recommandation) => {
    const id = rec.id?.value || "unknown"
    const personneId = rec.personneId?.value || ""
    const alimentId = rec.alimentId?.value || ""
    const activiteId = rec.activiteId?.value || ""
    const dateCreation = rec.dateCreation?.value || new Date().toISOString()

    return (
      <div key={id} className="p-4 bg-slate-50 rounded-lg border">
        <p className="font-semibold">
          Pour {getPersonneName(personneId)} : {getAlimentName(alimentId)}
        </p>
        {activiteId && (
          <p className="text-sm text-slate-600">
            Activité recommandée: {getActiviteName(activiteId)}
          </p>
        )}
        <p className="text-xs text-slate-500">
          {new Date(dateCreation).toLocaleDateString()}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          IDs: P:{normalizeId(personneId)} A:{normalizeId(alimentId)}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Recommandations</h1>
        <Button onClick={fetchInitialData} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer une Recommandation</CardTitle>
        </CardHeader>
        <CardContent>
          {!dataLoaded && aliments.length === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Aucun aliment trouvé. Vérifiez que votre base de données contient des aliments.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="personne">Personne *</Label>
                <Select
                  value={formData.personneId}
                  onValueChange={(value) => setFormData({ ...formData, personneId: value })}
                  disabled={personnes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      personnes.length === 0 ? "Aucune personne disponible" : "Sélectionner une personne"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {personnes.map((p) => (
                      <SelectItem key={p.id.value} value={p.id.value}>
                        {p.nom.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {personnes.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Aucune personne trouvée</p>
                )}
              </div>
              <div>
                <Label htmlFor="aliment">Aliment *</Label>
                <Select
                  value={formData.alimentId}
                  onValueChange={(value) => setFormData({ ...formData, alimentId: value })}
                  disabled={aliments.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      aliments.length === 0 ? "Aucun aliment disponible" : "Sélectionner un aliment"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {aliments.map((a) => (
                      <SelectItem key={a.id.value} value={a.id.value}>
                        {a.nom.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {aliments.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Aucun aliment trouvé</p>
                )}
              </div>
              <div>
                <Label htmlFor="activite">Activité (optionnel)</Label>
                <Select
                  value={formData.activiteId}
                  onValueChange={(value) => setFormData({ ...formData, activiteId: value })}
                  disabled={activites.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      activites.length === 0 ? "Aucune activité disponible" : "Sélectionner une activité"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {activites.map((a) => (
                      <SelectItem key={a.id.value} value={a.id.value}>
                        {a.nom.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || personnes.length === 0 || aliments.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Création..." : "Créer Recommandation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommandations Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : recommandations.length === 0 ? (
            <p className="text-slate-500">Aucune recommandation trouvée</p>
          ) : (
            <div className="space-y-2">
              {recommandations.slice(0, 10).map(renderRecommandation)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section de débogage */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-sm">Informations de débogage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p><strong>Personnes:</strong> {personnes.length}</p>
              <p><strong>Aliments:</strong> {aliments.length}</p>
              <p><strong>Activités:</strong> {activites.length}</p>
            </div>
            <div>
              <p><strong>Recommandations:</strong> {recommandations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}