"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Lightbulb, Sparkles, History, Zap, Brain, Activity, Scale, Filter, Droplets, Apple, Utensils, User, Heart, Clock, BarChart3, Target } from "lucide-react"

interface SearchResult {
  id: { value: string }
  nom: { value: string }
  type: { value: string }
  score?: { value: string }
  details?: { value: string }
  calories?: { value: string }
  indexGlycemique?: { value: string }
  teneurFibres?: { value: string }
  teneurSodium?: { value: string }
  âge?: { value: string }
  poids?: { value: string }
  taille?: { value: string }
  dureeActivite?: { value: string }
  description?: { value: string }
  tempsPréparation?: { value: string }
  niveauDifficulté?: { value: string }
  typeAllergie?: { value: string }
  doseRecommandée?: { value: string }
  unitéDose?: { value: string }
}

interface SearchResponse {
  results: SearchResult[]
  generated_sparql: string
  original_query: string
  count?: number
  success?: boolean
}

export default function SemanticSearchPanel() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)
  const [lastQuery, setLastQuery] = useState("")
  const [searchStats, setSearchStats] = useState<Record<string, number>>({})

  // Charger les suggestions et statistiques au démarrage
  useEffect(() => {
    fetchSuggestions()
    fetchSearchStats()
    
    // Charger l'historique depuis le localStorage
    const savedHistory = localStorage.getItem('semanticSearchHistory')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/search-suggestions')
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      // Suggestions par défaut en cas d'erreur
      setSuggestions([
        "Personnes de plus de 60 ans",
        "Aliments riches en fibres",
        "Recettes pour diabétiques",
        "Activités pour brûler des calories",
        "Aliments faibles en sodium",
      ])
    }
  }

  const fetchSearchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/search-stats')
      const data = await response.json()
      setSearchStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (!finalQuery.trim()) return

    setLoading(true)
    setResults([])
    setLastQuery(finalQuery)

    try {
      const response = await fetch('http://localhost:5000/api/semantic-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: finalQuery }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: SearchResponse = await response.json()
      
      if (data.results) {
        setResults(data.results)
        
        // Mettre à jour l'historique
        const newHistory = [finalQuery, ...searchHistory.filter(q => q !== finalQuery)].slice(0, 10)
        setSearchHistory(newHistory)
        localStorage.setItem('semanticSearchHistory', JSON.stringify(newHistory))
      }
    } catch (error) {
      console.error("Error searching:", error)
      alert(`Erreur lors de la recherche: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
    setLoading(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem)
    handleSearch(historyItem)
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "Aliment": return <Apple className="w-5 h-5" />
      case "Recette": return <Utensils className="w-5 h-5" />
      case "ActivitePhysique": return <Activity className="w-5 h-5" />
      case "Personne": return <User className="w-5 h-5" />
      case "Allergie": return <Heart className="w-5 h-5" />
      case "Nutriment": return <BarChart3 className="w-5 h-5" />
      case "Objectif": return <Target className="w-5 h-5" />
      default: return <Search className="w-5 h-5" />
    }
  }

  const getEntityColor = (type: string) => {
    switch (type) {
      case "Aliment": return "bg-green-50 border-green-200 hover:border-green-300"
      case "Recette": return "bg-blue-50 border-blue-200 hover:border-blue-300"
      case "ActivitePhysique": return "bg-orange-50 border-orange-200 hover:border-orange-300"
      case "Personne": return "bg-purple-50 border-purple-200 hover:border-purple-300"
      case "Allergie": return "bg-red-50 border-red-200 hover:border-red-300"
      case "Nutriment": return "bg-yellow-50 border-yellow-200 hover:border-yellow-300"
      case "Objectif": return "bg-indigo-50 border-indigo-200 hover:border-indigo-300"
      default: return "bg-gray-50 border-gray-200 hover:border-gray-300"
    }
  }

  const getEntityBadgeColor = (type: string) => {
    switch (type) {
      case "Aliment": return "bg-green-100 text-green-800 border border-green-200"
      case "Recette": return "bg-blue-100 text-blue-800 border border-blue-200"
      case "ActivitePhysique": return "bg-orange-100 text-orange-800 border border-orange-200"
      case "Personne": return "bg-purple-100 text-purple-800 border border-purple-200"
      case "Allergie": return "bg-red-100 text-red-800 border border-red-200"
      case "Nutriment": return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "Objectif": return "bg-indigo-100 text-indigo-800 border border-indigo-200"
      default: return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const getNutritionIcon = (type: string) => {
    switch (type) {
      case "calories": return <Activity className="w-4 h-4" />
      case "glycemique": return <Scale className="w-4 h-4" />
      case "fibres": return <Filter className="w-4 h-4" />
      case "sodium": return <Droplets className="w-4 h-4" />
      case "âge": return <User className="w-4 h-4" />
      case "poids": return <Scale className="w-4 h-4" />
      case "taille": return <BarChart3 className="w-4 h-4" />
      case "durée": return <Clock className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  const getNutritionColor = (type: string) => {
    switch (type) {
      case "calories": return "bg-orange-100 text-orange-800 border border-orange-200"
      case "glycemique": return "bg-green-100 text-green-800 border border-green-200"
      case "fibres": return "bg-blue-100 text-blue-800 border border-blue-200"
      case "sodium": return "bg-purple-100 text-purple-800 border border-purple-200"
      case "âge": return "bg-pink-100 text-pink-800 border border-pink-200"
      case "poids": return "bg-amber-100 text-amber-800 border border-amber-200"
      case "taille": return "bg-cyan-100 text-cyan-800 border border-cyan-200"
      case "durée": return "bg-teal-100 text-teal-800 border border-teal-200"
      default: return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const renderResultDetails = (result: SearchResult) => {
    const details = []

    // Informations pour les Personnes
    if (result.âge?.value) details.push({ type: "âge", label: "Âge", value: `${result.âge.value} ans` })
    if (result.poids?.value) details.push({ type: "poids", label: "Poids", value: `${result.poids.value} kg` })
    if (result.taille?.value) details.push({ type: "taille", label: "Taille", value: `${result.taille.value} cm` })

    // Informations pour les Aliments
    if (result.calories?.value) details.push({ type: "calories", label: "Calories", value: `${result.calories.value} kcal` })
    if (result.indexGlycemique?.value) details.push({ type: "glycemique", label: "Index Glycémique", value: result.indexGlycemique.value })
    if (result.teneurFibres?.value) details.push({ type: "fibres", label: "Fibres", value: `${result.teneurFibres.value}g` })
    if (result.teneurSodium?.value) details.push({ type: "sodium", label: "Sodium", value: `${result.teneurSodium.value}mg` })

    // Informations pour les Activités
    if (result.dureeActivite?.value) details.push({ type: "durée", label: "Durée", value: `${result.dureeActivite.value} min` })

    // Informations pour les Recettes
    if (result.tempsPréparation?.value) details.push({ type: "durée", label: "Préparation", value: `${result.tempsPréparation.value} min` })
    if (result.niveauDifficulté?.value) details.push({ type: "difficulté", label: "Difficulté", value: result.niveauDifficulté.value })

    // Informations pour les Nutriments
    if (result.doseRecommandée?.value) {
      const unite = result.unitéDose?.value || 'mg'
      details.push({ type: "dose", label: "Dose Recommandée", value: `${result.doseRecommandée.value} ${unite}` })
    }

    // Informations pour les Allergies
    if (result.typeAllergie?.value) details.push({ type: "type", label: "Type", value: result.typeAllergie.value })

    return details
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header avec Statistiques */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Recherche Sémantique Intelligente
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Posez vos questions en langage naturel et découvrez des résultats pertinents dans votre base de connaissances nutritionnelles
        </p>
        
        {/* Statistiques */}
        {Object.keys(searchStats).length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {Object.entries(searchStats).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border shadow-sm">
                {getEntityIcon(type)}
                <span className="font-semibold text-slate-700">{count}</span>
                <span className="text-slate-500 text-sm capitalize">{type}s</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Card */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Brain className="w-6 h-6" />
            Recherche Intelligente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Search Input */}
          <div className="space-y-3">
            <Label htmlFor="search" className="text-lg font-semibold flex items-center gap-2">
              <Search className="w-5 h-5" />
              Quelle est votre question ?
            </Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Personnes de plus de 50 ans pesant moins de 80kg, Aliments riches en fibres avec faible index glycémique, Recettes pour diabétiques..."
                className="flex-1 text-lg py-6 border-2 border-blue-200 focus:border-blue-500 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={() => handleSearch()} 
                disabled={loading || !query.trim()}
                className="py-6 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Lightbulb className="w-4 h-4" />
              <span className="font-semibold">Suggestions rapides :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <History className="w-4 h-4" />
                <span className="font-semibold">Historique récent :</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((historyItem, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHistoryClick(historyItem)}
                    className="text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    {historyItem.length > 40 ? historyItem.substring(0, 40) + "..." : historyItem}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Toggle */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">
          {lastQuery && `Recherche pour : "${lastQuery}"`}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {showDebug ? "Masquer les détails techniques" : "Afficher les détails techniques"}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Search className="w-5 h-5" />
              Résultats de la recherche
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              {results.map((result, index) => {
                const details = renderResultDetails(result)
                return (
                  <div 
                    key={`${result.id.value}-${index}`} 
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${getEntityColor(result.type.value)}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-3">
                          {getEntityIcon(result.type.value)}
                          <div>
                            <h3 className="font-bold text-xl text-slate-800">{result.nom.value}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEntityBadgeColor(result.type.value)}`}>
                                {result.type.value}
                              </span>
                              {result.score && Number.parseFloat(result.score.value) !== 1.0 && (
                                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  Score: {Number.parseFloat(result.score.value).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informations détaillées */}
                    {details.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {details.map((detail, detailIndex) => (
                          <div 
                            key={detailIndex} 
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getNutritionColor(detail.type)}`}
                          >
                            {getNutritionIcon(detail.type)}
                            <span className="text-sm font-medium">
                              <span className="font-semibold">{detail.label} :</span> {detail.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Description si disponible */}
                    {result.description?.value && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-700">{result.description.value}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {results.length === 0 && !loading && lastQuery && (
        <Card className="shadow-lg">
          <CardContent className="py-16 text-center">
            <Search className="w-20 h-20 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Aucun résultat trouvé</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Essayez de reformuler votre question ou utilisez une des suggestions ci-dessus.
              Vous pouvez aussi essayer des termes plus génériques.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.slice(0, 4).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="shadow-lg">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-600 text-lg font-semibold mb-2">Analyse sémantique en cours...</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Notre IA analyse votre question et recherche les informations les plus pertinentes dans la base de connaissances
              </p>
              <div className="mt-6 flex gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Initial State - Guide d'utilisation */}
      {!loading && results.length === 0 && !lastQuery && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Guide Personnes */}
          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="flex items-center gap-2 text-purple-700 text-lg">
                <User className="w-5 h-5" />
                Recherche de Personnes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>"<strong>Personnes de plus de 60 ans</strong>"</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>"<strong>Utilisateurs pesant 70kg</strong>"</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>"<strong>Jeunes de moins de 30 ans</strong>"</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>"<strong>Personnes taille 175cm</strong>"</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Guide Aliments */}
          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
                <Apple className="w-5 h-5" />
                Recherche d'Aliments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>"<strong>Aliments riches en fibres</strong>"</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>"<strong>Faible index glycémique</strong>"</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>"<strong>Moins de 200 calories</strong>"</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>"<strong>Riche en protéines</strong>"</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Guide Recettes & Activités */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
                <Utensils className="w-5 h-5" />
                Recettes & Activités
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>"<strong>Recettes pour diabétiques</strong>"</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>"<strong>Plats végétariens</strong>"</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>"<strong>Activités cardio</strong>"</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>"<strong>Exercices 30 minutes</strong>"</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debug Info */}
      {showDebug && lastQuery && (
        <Card className="bg-slate-50 border-2 border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
              <Sparkles className="w-4 h-4" />
              Détails techniques de la recherche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <Label className="text-slate-600 font-semibold">Question originale :</Label>
              <p className="font-mono bg-white p-3 rounded border mt-1 text-slate-800 border-slate-300">{lastQuery}</p>
            </div>
            
            {results.length > 0 && (
              <>
                <div>
                  <Label className="text-slate-600 font-semibold">Type d'entité détecté :</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getEntityIcon(results[0].type.value)}
                    <span className="font-medium text-slate-800">{results[0].type.value}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-slate-600 font-semibold">Champs retournés :</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {results[0].calories && <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm border border-orange-200">Calories</span>}
                    {results[0].indexGlycemique && <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm border border-green-200">Index Glycémique</span>}
                    {results[0].teneurFibres && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm border border-blue-200">Fibres</span>}
                    {results[0].teneurSodium && <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm border border-purple-200">Sodium</span>}
                    {results[0].âge && <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded text-sm border border-pink-200">Âge</span>}
                    {results[0].poids && <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded text-sm border border-amber-200">Poids</span>}
                    {results[0].taille && <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded text-sm border border-cyan-200">Taille</span>}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}