"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, RefreshCw, Apple, Scale, Utensils, ChefHat } from "lucide-react"

interface AlimentRelation {
  alimentId: { value: string }
  alimentNom: { value: string }
  typeRelation: { value: string }
  cibleId: { value: string }
  cibleNom: { value: string }
  quantite: { value: string }
  unite: { value: string }
}

interface Aliment {
  id: { value: string }
  nom: { value: string }
}

interface Nutriment {
  id: { value: string }
  nom: { value: string }
}

interface Repas {
  id: { value: string }
  nom: { value: string }
}

interface Recette {
  id: { value: string }
  nom: { value: string }
}

export default function GestionRelationsAliment() {
  const [relations, setRelations] = useState<AlimentRelation[]>([])
  const [aliments, setAliments] = useState<Aliment[]>([])
  const [nutriments, setNutriments] = useState<Nutriment[]>([])
  const [repas, setRepas] = useState<Repas[]>([])
  const [recettes, setRecettes] = useState<Recette[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedAliment, setSelectedAliment] = useState("")
  const [formData, setFormData] = useState({
    typeRelation: "",
    cibleId: "",
    quantite: "",
    unite: "g"
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchAllRelations(),
        fetchAliments(),
        fetchNutriments(),
        fetchRepas(),
        fetchRecettes()
      ])
    } catch (error) {
      console.error("[Aliments] Error fetching data:", error)
      setError("Erreur lors du chargement des données")
    }
    setLoading(false)
  }

  const fetchAllRelations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/relations-aliments")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("[Aliments] All relations fetched:", data)
      setRelations(data)
    } catch (error) {
      console.error("[Aliments] Error fetching relations:", error)
      setError(`Erreur lors du chargement des relations: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const fetchAliments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/aliments")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setAliments(data)
    } catch (error) {
      console.error("[Aliments] Error fetching aliments:", error)
      setError("Erreur lors du chargement des aliments")
    }
  }

  const fetchNutriments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/nutriments")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setNutriments(data)
    } catch (error) {
      console.error("[Aliments] Error fetching nutriments:", error)
      setError("Erreur lors du chargement des nutriments")
    }
  }

  const fetchRepas = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/repas")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setRepas(data)
    } catch (error) {
      console.error("[Aliments] Error fetching repas:", error)
      setError("Erreur lors du chargement des repas")
    }
  }

  const fetchRecettes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/recettes")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setRecettes(data)
    } catch (error) {
      console.error("[Aliments] Error fetching recettes:", error)
      setError("Erreur lors du chargement des recettes")
    }
  }

  const getCibleOptions = () => {
    switch (formData.typeRelation) {
      case "NUTRIMENT":
        return nutriments
      case "REPAS":
        return repas
      case "RECETTE":
        return recettes
      default:
        return []
    }
  }

  const getRelationLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      "NUTRIMENT": "contient",
      "REPAS": "est dans le repas", 
      "RECETTE": "est dans la recette"
    }
    return labels[type] || type
  }

  const getTypeDisplayName = (type: string) => {
    const names: { [key: string]: string } = {
      "NUTRIMENT": "Nutriment",
      "REPAS": "Repas", 
      "RECETTE": "Recette"
    }
    return names[type] || type
  }

  const getRelationsForAliment = (alimentId: string) => {
    return relations.filter(rel => rel.alimentId.value === alimentId)
  }

  const getAlimentsAvecRelations = () => {
    return aliments.filter(a => getRelationsForAliment(a.id.value).length > 0)
  }

  const getRelationIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      "NUTRIMENT": <Scale className="w-4 h-4 text-blue-500" />,
      "REPAS": <Utensils className="w-4 h-4 text-green-500" />,
      "RECETTE": <ChefHat className="w-4 h-4 text-purple-500" />
    }
    return icons[type] || <Apple className="w-4 h-4" />
  }

  const getRelationColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "NUTRIMENT": "bg-blue-50 border-blue-200",
      "REPAS": "bg-green-50 border-green-200", 
      "RECETTE": "bg-purple-50 border-purple-200"
    }
    return colors[type] || "bg-gray-50 border-gray-200"
  }

  const getBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "NUTRIMENT": "bg-blue-100 text-blue-800 hover:bg-blue-100",
      "REPAS": "bg-green-100 text-green-800 hover:bg-green-100",
      "RECETTE": "bg-purple-100 text-purple-800 hover:bg-purple-100"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    if (!selectedAliment || !formData.typeRelation || !formData.cibleId || !formData.quantite) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/aliments/${selectedAliment}/relations`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setFormData({ typeRelation: "", cibleId: "", quantite: "", unite: "g" })
        setSelectedAliment("")
        setSuccess("Relation aliment créée avec succès!")
        fetchAllRelations()
      } else {
        throw new Error(result.error || "Erreur inconnue")
      }
    } catch (error) {
      console.error("[Aliments] Error submitting form:", error)
      setError(`Erreur lors de la création: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
    setLoading(false)
  }

  const handleDelete = async (alimentId: string, typeRelation: string, cibleId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette relation ?")) {
      return
    }

    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch(`http://localhost:5000/api/aliments/${alimentId}/relations/${typeRelation}/${cibleId}`, { 
        method: "DELETE" 
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setSuccess("Relation aliment supprimée avec succès!")
        fetchAllRelations()
      } else {
        throw new Error(result.error || "Erreur inconnue")
      }
    } catch (error) {
      console.error("[Aliments] Error deleting relation:", error)
      setError(`Erreur lors de la suppression: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Relations Aliments</h1>
          <p className="text-slate-600 mt-1">Gérez les nutriments, repas et recettes des aliments</p>
        </div>
        <Button onClick={fetchData} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Messages d'alerte */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex justify-between items-start">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearMessages} className="text-red-700 hover:text-red-800">
              ×
            </Button>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <div className="flex justify-between items-start">
            <span>{success}</span>
            <Button variant="ghost" size="sm" onClick={clearMessages} className="text-green-700 hover:text-green-800">
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Formulaire de création */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Créer une Nouvelle Relation Aliment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="aliment">Aliment *</Label>
                <Select
                  value={selectedAliment}
                  onValueChange={(value) => {
                    setSelectedAliment(value)
                    clearMessages()
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un aliment" />
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
                  <p className="text-xs text-red-500 mt-1">Aucun aliment disponible</p>
                )}
              </div>

              <div>
                <Label htmlFor="typeRelation">Type de Relation *</Label>
                <Select
                  value={formData.typeRelation}
                  onValueChange={(value) => {
                    setFormData({ ...formData, typeRelation: value, cibleId: "" })
                    clearMessages()
                  }}
                  disabled={loading || !selectedAliment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type de relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUTRIMENT">Nutriment</SelectItem>
                    <SelectItem value="REPAS">Repas</SelectItem>
                    <SelectItem value="RECETTE">Recette</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cibleId">
                  {formData.typeRelation ? getTypeDisplayName(formData.typeRelation) + " *" : "Cible *"}
                </Label>
                <Select
                  value={formData.cibleId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, cibleId: value })
                    clearMessages()
                  }}
                  disabled={loading || !formData.typeRelation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      formData.typeRelation ? `Sélectionner ${getTypeDisplayName(formData.typeRelation).toLowerCase()}` : "Choisir type d'abord"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {getCibleOptions().map((item) => (
                      <SelectItem key={item.id.value} value={item.id.value}>
                        {item.nom.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.typeRelation && getCibleOptions().length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Aucun {getTypeDisplayName(formData.typeRelation).toLowerCase()} disponible
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="quantite">Quantité *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="100"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="unite">Unité</Label>
                  <Select
                    value={formData.unite}
                    onValueChange={(value) => setFormData({ ...formData, unite: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="portion">portion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !selectedAliment || !formData.typeRelation || !formData.cibleId || !formData.quantite}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Création..." : "Créer Relation Aliment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des aliments AVEC relations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-slate-600" />
              <span>Aliments avec Relations</span>
            </div>
            <Badge variant="secondary">
              {getAlimentsAvecRelations().length} aliment{getAlimentsAvecRelations().length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-600">Chargement des relations...</span>
            </div>
          ) : getAlimentsAvecRelations().length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Apple className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Aucun aliment avec des relations</p>
              <p className="text-sm mt-1">Créez votre première relation ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-6">
              {getAlimentsAvecRelations().map((aliment) => {
                const alimentRelations = getRelationsForAliment(aliment.id.value)
                
                return (
                  <div key={aliment.id.value} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                          <Apple className="w-5 h-5 text-slate-500" />
                          {aliment.nom.value}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {alimentRelations.length} relation{alimentRelations.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge variant="outline">
                        ID: {aliment.id.value}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {alimentRelations.map((relation, index) => (
                        <div 
                          key={index} 
                          className={`flex justify-between items-center p-3 rounded-lg border ${getRelationColor(relation.typeRelation.value)}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {getRelationIcon(relation.typeRelation.value)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900">
                                  {getRelationLabel(relation.typeRelation.value)}:
                                </span>
                                <Badge variant="secondary" className={getBadgeColor(relation.typeRelation.value)}>
                                  {getTypeDisplayName(relation.typeRelation.value)}
                                </Badge>
                              </div>
                              <p className="text-slate-700 mt-1">
                                {relation.cibleNom?.value || relation.cibleId.value}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Quantité: {relation.quantite.value} {relation.unite.value}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(
                              relation.alimentId.value, 
                              relation.typeRelation.value, 
                              relation.cibleId.value
                            )}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section de débogage */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-sm text-slate-600">Informations de débogage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p><strong>Aliments:</strong> {aliments.length}</p>
              <p><strong>Nutriments:</strong> {nutriments.length}</p>
            </div>
            <div>
              <p><strong>Repas:</strong> {repas.length}</p>
              <p><strong>Recettes:</strong> {recettes.length}</p>
            </div>
            <div>
              <p><strong>Relations:</strong> {relations.length}</p>
              <p><strong>Avec relations:</strong> {getAlimentsAvecRelations().length}</p>
            </div>
            <div>
              <p><strong>Statut:</strong> {loading ? "Chargement..." : "Prêt"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}