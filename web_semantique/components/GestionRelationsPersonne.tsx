"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, RefreshCw, User, AlertCircle, CheckCircle2 } from "lucide-react"

interface PersonneRelation {
  personneId: { value: string }
  personneNom: { value: string }
  typeRelation: { value: string }
  cibleId: { value: string }
  cibleNom: { value: string }
}

interface Personne {
  id: { value: string }
  nom: { value: string }
}

interface Allergie {
  id: { value: string }
  nom: { value: string }
}

interface Condition {
  id: { value: string }
  nom: { value: string }
}

interface Preference {
  id: { value: string }
  nom: { value: string }
}

interface Objectif {
  id: { value: string }
  nom: { value: string }
}

export default function GestionRelationsPersonne() {
  const [relations, setRelations] = useState<PersonneRelation[]>([])
  const [personnes, setPersonnes] = useState<Personne[]>([])
  const [allergies, setAllergies] = useState<Allergie[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [preferences, setPreferences] = useState<Preference[]>([])
  const [objectifs, setObjectifs] = useState<Objectif[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedPersonne, setSelectedPersonne] = useState("")
  const [formData, setFormData] = useState({
    typeRelation: "",
    cibleId: ""
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
        fetchPersonnes(),
        fetchAllergies(),
        fetchConditions(),
        fetchPreferences(),
        fetchObjectifs()
      ])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      setError("Erreur lors du chargement des données")
    }
    setLoading(false)
  }

  const fetchAllRelations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/relations-personnes")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("[v0] All relations fetched:", data)
      setRelations(data)
    } catch (error) {
      console.error("[v0] Error fetching relations:", error)
      setError(`Erreur lors du chargement des relations: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const fetchPersonnes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/personnes")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("[v0] Personnes fetched:", data)
      setPersonnes(data)
    } catch (error) {
      console.error("[v0] Error fetching personnes:", error)
      setError("Erreur lors du chargement des personnes")
    }
  }

  const fetchAllergies = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/allergies")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setAllergies(data)
    } catch (error) {
      console.error("[v0] Error fetching allergies:", error)
      setError("Erreur lors du chargement des allergies")
    }
  }

  const fetchConditions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/conditions")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setConditions(data)
    } catch (error) {
      console.error("[v0] Error fetching conditions:", error)
      setError("Erreur lors du chargement des conditions médicales")
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/preferences")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setPreferences(data)
    } catch (error) {
      console.error("[v0] Error fetching preferences:", error)
      setError("Erreur lors du chargement des préférences")
    }
  }

  const fetchObjectifs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/objectifs")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setObjectifs(data)
    } catch (error) {
      console.error("[v0] Error fetching objectifs:", error)
      setError("Erreur lors du chargement des objectifs")
    }
  }

  const getCibleOptions = () => {
    switch (formData.typeRelation) {
      case "ALLERGIE":
        return allergies
      case "CONDITION":
        return conditions
      case "PREFERENCE":
        return preferences
      case "OBJECTIF":
        return objectifs
      default:
        return []
    }
  }

  const getRelationLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      "ALLERGIE": "Allergie",
      "CONDITION": "Condition médicale", 
      "PREFERENCE": "Préférence",
      "OBJECTIF": "Objectif"
    }
    return labels[type] || type
  }

  const getTypeDisplayName = (type: string) => {
    const names: { [key: string]: string } = {
      "ALLERGIE": "Allergie",
      "CONDITION": "Condition médicale", 
      "PREFERENCE": "Préférence alimentaire",
      "OBJECTIF": "Objectif"
    }
    return names[type] || type
  }

  const getRelationsForPersonne = (personneId: string) => {
    // Gestion des différents formats d'ID
    const formatsPossibles = [
      personneId, // Format original "personne_alice"
      `personne_${personneId}`, // Format "personne_personne_alice"
      personneId.startsWith('personne_') ? personneId : `personne_${personneId}`
    ];
    
    console.log(`[DEBUG] Recherche relations pour: ${personneId}`);
    console.log(`[DEBUG] Formats possibles:`, formatsPossibles);
    
    const result = relations.filter(rel => {
      const match = formatsPossibles.some(format => 
        rel.personneId.value === format || 
        rel.personneId.value.includes(personneId.replace('personne_', ''))
      );
      
      if (match) {
        console.log(`[DEBUG] Relation trouvée:`, rel);
      }
      
      return match;
    });
    
    console.log(`[DEBUG] ${result.length} relations trouvées pour ${personneId}`);
    return result;
  }

  const getPersonnesAvecRelations = () => {
    const personnesAvecRelations = personnes.filter(p => {
      const relationsCount = getRelationsForPersonne(p.id.value).length;
      console.log(`[DEBUG] ${p.nom.value} (${p.id.value}): ${relationsCount} relations`);
      return relationsCount > 0;
    });
    
    console.log(`[DEBUG] Personnes avec relations:`, personnesAvecRelations);
    return personnesAvecRelations;
  }

  const getRelationIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      "ALLERGIE": <AlertCircle className="w-4 h-4 text-red-500" />,
      "CONDITION": <AlertCircle className="w-4 h-4 text-orange-500" />,
      "PREFERENCE": <CheckCircle2 className="w-4 h-4 text-green-500" />,
      "OBJECTIF": <CheckCircle2 className="w-4 h-4 text-blue-500" />
    }
    return icons[type] || <User className="w-4 h-4" />
  }

  const getRelationColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "ALLERGIE": "bg-red-50 border-red-200",
      "CONDITION": "bg-orange-50 border-orange-200", 
      "PREFERENCE": "bg-green-50 border-green-200",
      "OBJECTIF": "bg-blue-50 border-blue-200"
    }
    return colors[type] || "bg-gray-50 border-gray-200"
  }

  const getBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "ALLERGIE": "bg-red-100 text-red-800 hover:bg-red-100",
      "CONDITION": "bg-orange-100 text-orange-800 hover:bg-orange-100",
      "PREFERENCE": "bg-green-100 text-green-800 hover:bg-green-100",
      "OBJECTIF": "bg-blue-100 text-blue-800 hover:bg-blue-100"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    if (!selectedPersonne || !formData.typeRelation || !formData.cibleId) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/personnes/${selectedPersonne}/relations`, {
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
        setFormData({ typeRelation: "", cibleId: "" })
        setSelectedPersonne("")
        setSuccess("Relation créée avec succès!")
        fetchAllRelations()
      } else {
        throw new Error(result.error || "Erreur inconnue")
      }
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
      setError(`Erreur lors de la création: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
    setLoading(false)
  }

  const handleDelete = async (personneId: string, typeRelation: string, cibleId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette relation ?")) {
      return
    }

    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch(`http://localhost:5000/api/personnes/${personneId}/relations/${typeRelation}/${cibleId}`, { 
        method: "DELETE" 
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setSuccess("Relation supprimée avec succès!")
        fetchAllRelations()
      } else {
        throw new Error(result.error || "Erreur inconnue")
      }
    } catch (error) {
      console.error("[v0] Error deleting relation:", error)
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
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Relations Personnes</h1>
          <p className="text-slate-600 mt-1">Gérez les allergies, conditions médicales, préférences et objectifs</p>
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
            Créer une Nouvelle Relation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="personne">Personne *</Label>
                <Select
                  value={selectedPersonne}
                  onValueChange={(value) => {
                    setSelectedPersonne(value)
                    clearMessages()
                  }}
                  disabled={loading}
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
                {personnes.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Aucune personne disponible</p>
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
                  disabled={loading || !selectedPersonne}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type de relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALLERGIE">Allergie</SelectItem>
                    <SelectItem value="CONDITION">Condition médicale</SelectItem>
                    <SelectItem value="PREFERENCE">Préférence alimentaire</SelectItem>
                    <SelectItem value="OBJECTIF">Objectif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cibleId">
                  {formData.typeRelation ? getTypeDisplayName(formData.typeRelation) + " *" : "Élément lié *"}
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
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !selectedPersonne || !formData.typeRelation || !formData.cibleId}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Création..." : "Créer Relation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des personnes AVEC relations UNIQUEMENT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              <span>Personnes avec Relations</span>
            </div>
            <Badge variant="secondary">
              {getPersonnesAvecRelations().length} personne{getPersonnesAvecRelations().length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-600">Chargement des relations...</span>
            </div>
          ) : getPersonnesAvecRelations().length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Aucune personne avec des relations</p>
              <p className="text-sm mt-1">Créez votre première relation ci-dessus</p>
              <div className="mt-4 text-xs text-slate-400">
                <p>Debug: {personnes.length} personnes chargées</p>
                <p>Debug: {relations.length} relations chargées</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {getPersonnesAvecRelations().map((personne) => {
                const personneRelations = getRelationsForPersonne(personne.id.value)
                
                return (
                  <div key={personne.id.value} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                          <User className="w-5 h-5 text-slate-500" />
                          {personne.nom.value}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {personneRelations.length} relation{personneRelations.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge variant="outline">
                        ID: {personne.id.value}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {personneRelations.map((relation, index) => (
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
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(
                              relation.personneId.value, 
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
              <p><strong>Personnes:</strong> {personnes.length}</p>
              <p><strong>Allergies:</strong> {allergies.length}</p>
            </div>
            <div>
              <p><strong>Conditions:</strong> {conditions.length}</p>
              <p><strong>Préférences:</strong> {preferences.length}</p>
            </div>
            <div>
              <p><strong>Objectifs:</strong> {objectifs.length}</p>
              <p><strong>Relations:</strong> {relations.length}</p>
            </div>
            <div>
              <p><strong>Avec relations:</strong> {getPersonnesAvecRelations().length}</p>
              <p><strong>Statut:</strong> {loading ? "Chargement..." : "Prêt"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}