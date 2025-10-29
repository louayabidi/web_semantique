"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Lightbulb, Sparkles, History, Zap, Brain, Activity, Scale, Filter, Droplets, Apple, Utensils, User } from "lucide-react"

// Interface pour les résultats bruts de l'API
interface RawApiResult {
  id: { value: string }
  nom: { value: string }
  type: { value: string }
  calories?: { value: string }
  indexGlycemique?: { value: string }
  teneurFibres?: { value: string }
  teneurSodium?: { value: string }
}

// Interface pour les résultats formatés
interface SearchResult {
  id: string
  nom: string
  type: string
  calories?: string
  indexGlycemique?: string
  teneurFibres?: string
  teneurSodium?: string
}

interface ApiSearchResponse {
  results: RawApiResult[]
  generated_sparql?: string
  original_query?: string
}

export default function SemanticSearchPanel() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)
  const [lastQuery, setLastQuery] = useState("")
  const [generatedSparql, setGeneratedSparql] = useState("")

  useEffect(() => {
    fetchSuggestions()
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('semanticSearchHistory')
      if (savedHistory) {
        try {
          setSearchHistory(JSON.parse(savedHistory))
        } catch (e) {
          console.error("Error parsing history:", e)
        }
      }
    }
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/search-suggestions')
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([
        "Aliments riches en fibres",
        "Aliments à faible index glycémique",
        "Aliments pour diabétiques",
        "Aliments pour perdre du poids",
        "Top 10 aliments faibles en calories"
      ])
    }
  }

  // Fonction pour extraire la valeur d'un objet API
  const extractValue = (obj: any): string => {
    if (!obj) return ""
    if (typeof obj === 'string') return obj
    if (obj.value) return obj.value
    return ""
  }

  // Fonction pour formater les résultats de l'API
  const formatResults = (rawResults: RawApiResult[]): SearchResult[] => {
    return rawResults.map(raw => ({
      id: extractValue(raw.id),
      nom: extractValue(raw.nom),
      type: extractValue(raw.type),
      calories: raw.calories ? extractValue(raw.calories) : undefined,
      indexGlycemique: raw.indexGlycemique ? extractValue(raw.indexGlycemique) : undefined,
      teneurFibres: raw.teneurFibres ? extractValue(raw.teneurFibres) : undefined,
      teneurSodium: raw.teneurSodium ? extractValue(raw.teneurSodium) : undefined,
    }))
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

      const data: ApiSearchResponse = await response.json()
      
      console.log("API Response:", data)
      
      if (data.results && data.results.length > 0) {
        // Formater les résultats avant de les stocker
        const formattedResults = formatResults(data.results)
        setResults(formattedResults)
        setGeneratedSparql(data.generated_sparql || "")
        
        // Mettre à jour l'historique
        if (typeof window !== 'undefined') {
          const newHistory = [finalQuery, ...searchHistory.filter(q => q !== finalQuery)].slice(0, 10)
          setSearchHistory(newHistory)
          localStorage.setItem('semanticSearchHistory', JSON.stringify(newHistory))
        }
      } else {
        setResults([])
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
      case "Activité": return <Activity className="w-5 h-5" />
      case "Personne": return <User className="w-5 h-5" />
      default: return <Search className="w-5 h-5" />
    }
  }

  const getEntityColor = (type: string) => {
    switch (type) {
      case "Aliment": return "bg-green-50 border-green-200"
      case "Recette": return "bg-blue-50 border-blue-200"
      case "Activité": return "bg-orange-50 border-orange-200"
      case "Personne": return "bg-purple-50 border-purple-200"
      default: return "bg-gray-50 border-gray-200"
    }
  }

  const getEntityBadgeColor = (type: string) => {
    switch (type) {
      case "Aliment": return "bg-green-100 text-green-800"
      case "Recette": return "bg-blue-100 text-blue-800"
      case "Activité": return "bg-orange-100 text-orange-800"
      case "Personne": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getNutritionColor = (type: string) => {
    switch (type) {
      case "calories": return "bg-orange-100 text-orange-800"
      case "glycemique": return "bg-green-100 text-green-800"
      case "fibres": return "bg-blue-100 text-blue-800"
      case "sodium": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Recherche Sémantique Intelligente
        </h1>
        <p className="text-slate-600 mt-2">
          Posez vos questions en langage naturel et découvrez des résultats pertinents
        </p>
      </div>

      {/* Search Card */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Search Input */}
          <div className="space-y-3">
            <Label htmlFor="search" className="text-lg font-semibold">
              Quelle est votre question ?
            </Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Quels aliments sont riches en fibres et faibles en calories ?"
                className="flex-1 text-lg py-6 border-2 border-blue-200 focus:border-blue-500 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={() => handleSearch()} 
                disabled={loading || !query.trim()}
                className="py-6 px-8 bg-blue-600 hover:bg-blue-700 transition-colors"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                {loading ? "Recherche..." : "Rechercher"}
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
                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
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
                <span className="font-semibold">Historique :</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((historyItem, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHistoryClick(historyItem)}
                    className="text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    {historyItem}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Toggle */}
      {results.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {showDebug ? "Masquer les détails" : "Afficher les détails"}
          </Button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Search className="w-5 h-5" />
              Résultats pour : &quot;{lastQuery}&quot;
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({results.length} résultat{results.length > 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {results.map((result, index) => (
                <div 
                  key={`${result.id}-${index}`} 
                  className={`p-4 rounded-lg border-2 ${getEntityColor(result.type)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {getEntityIcon(result.type)}
                          <span className="font-semibold text-lg">{result.nom}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEntityBadgeColor(result.type)}`}>
                          {result.type}
                        </span>
                      </div>
                      
                      {/* Informations nutritionnelles */}
                      {(result.calories || result.indexGlycemique || result.teneurFibres || result.teneurSodium) && (
                        <div className="flex flex-wrap gap-3">
                          {result.calories && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getNutritionColor("calories")}`}>
                              <Activity className="w-4 h-4" />
                              <span className="text-sm font-medium">{result.calories} calories</span>
                            </div>
                          )}
                          {result.indexGlycemique && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getNutritionColor("glycemique")}`}>
                              <Scale className="w-4 h-4" />
                              <span className="text-sm font-medium">IG: {result.indexGlycemique}</span>
                            </div>
                          )}
                          {result.teneurFibres && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getNutritionColor("fibres")}`}>
                              <Filter className="w-4 h-4" />
                              <span className="text-sm font-medium">{result.teneurFibres}g fibres</span>
                            </div>
                          )}
                          {result.teneurSodium && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getNutritionColor("sodium")}`}>
                              <Droplets className="w-4 h-4" />
                              <span className="text-sm font-medium">{result.teneurSodium}mg sodium</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {results.length === 0 && !loading && lastQuery && (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="w-20 h-20 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-600">Aucun résultat trouvé</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Essayez de reformuler votre question ou utilisez une des suggestions ci-dessus.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg font-semibold">Analyse de votre question en cours...</p>
            <p className="text-sm text-slate-500 mt-2">
              Recherche sémantique dans la base de connaissances
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!loading && results.length === 0 && !lastQuery && (
        <Card>
          <CardContent className="py-16 text-center">
            <Brain className="w-20 h-20 mx-auto mb-4 text-blue-300" />
            <h3 className="text-xl font-semibold text-slate-600">Commencez votre recherche</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Posez une question en langage naturel pour découvrir des aliments, recettes 
              et activités adaptés à vos besoins nutritionnels.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {showDebug && lastQuery && (
        <Card className="bg-slate-50 border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
              <Sparkles className="w-4 h-4" />
              Détails techniques de la recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <Label className="text-slate-600">Question originale :</Label>
                <p className="font-mono bg-white p-3 rounded border mt-1 text-slate-800">{lastQuery}</p>
              </div>
              {generatedSparql && (
                <div>
                  <Label className="text-slate-600">Requête SPARQL générée :</Label>
                  <pre className="font-mono bg-white p-3 rounded border mt-1 text-xs overflow-x-auto text-slate-800">
                    {generatedSparql}
                  </pre>
                </div>
              )}
              <div>
                <Label className="text-slate-600">Nombre de résultats :</Label>
                <p className="mt-1 font-medium">{results.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}