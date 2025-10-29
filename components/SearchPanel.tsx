"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Lightbulb, Sparkles, History, Zap, Brain, Activity, Scale, Filter, Droplets, Apple, Utensils, User, Heart, TrendingUp, Clock, Target } from "lucide-react"

interface SearchResult {
  id: string
  nom: string
  type: string
  score?: number
  description?: string
  calories?: string
  indexGlycémique?: string
  fibres?: string
  sodium?: string
  âge?: string
  poids?: string
  taille?: string
}

interface SearchResponse {
  results: SearchResult[]
  analysis?: {
    intent: string
    entities: string[]
    filters: string[]
    context: any
  }
  generated_sparql?: string
  original_query: string
  result_count: number
  suggestions?: string[]
}

export default function SemanticSearchPanel() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)
  const [lastQuery, setLastQuery] = useState("")
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    fetchSuggestions()
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
      setSuggestions([
        "Quels aliments sont riches en fibres et pauvres en calories ?",
        "Montre-moi des recettes pour diabétiques",
        "Activités physiques pour brûler des calories",
        "Aliments recommandés pour l'hypertension",
      ])
    }
  }

  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (!finalQuery.trim()) return

    setLoading(true)
    setResults([])
    setLastQuery(finalQuery)
    setAnalysis(null)

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
        setAnalysis(data.analysis)
        
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
    switch (type.toLowerCase()) {
      case "aliment": return <Apple className="w-5 h-5" />
      case "recette": return <Utensils className="w-5 h-5" />
      case "activité": return <Activity className="w-5 h-5" />
      case "personne": return <User className="w-5 h-5" />
      case "nutriment": return <Heart className="w-5 h-5" />
      case "condition": return <Target className="w-5 h-5" />
      default: return <Search className="w-5 h-5" />
    }
  }

  const getEntityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "aliment": return "bg-green-50 border-green-200"
      case "recette": return "bg-blue-50 border-blue-200"
      case "activité": return "bg-orange-50 border-orange-200"
      case "personne": return "bg-purple-50 border-purple-200"
      case "nutriment": return "bg-red-50 border-red-200"
      case "condition": return "bg-pink-50 border-pink-200"
      default: return "bg-gray-50 border-gray-200"
    }
  }

  const getEntityBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "aliment": return "bg-green-100 text-green-800"
      case "recette": return "bg-blue-100 text-blue-800"
      case "activité": return "bg-orange-100 text-orange-800"
      case "personne": return "bg-purple-100 text-purple-800"
      case "nutriment": return "bg-red-100 text-red-800"
      case "condition": return "bg-pink-100 text-pink-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'recherche': return <Search className="w-4 h-4" />
      case 'recommandation': return <Lightbulb className="w-4 h-4" />
      case 'comparaison': return <Scale className="w-4 h-4" />
      case 'statistique': return <TrendingUp className="w-4 h-4" />
      case 'planification': return <Clock className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Assistant Nutritionnel Intelligent
        </h1>
        <p className="text-slate-600 mt-2">
          IA avancée pour des réponses précises et contextuelles
        </p>
      </div>

      {/* Search Card */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Recherche Intelligente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Search Input */}
          <div className="space-y-3">
            <Label htmlFor="search" className="text-lg font-semibold">
              Posez votre question naturellement :
            </Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Quels aliments riches en fibres pour le diabète ?"
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
                {loading ? "Analyse..." : "Rechercher"}
              </Button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Lightbulb className="w-4 h-4" />
              <span className="font-semibold">Suggestions intelligentes :</span>
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

      {/* Analysis Info */}
      {analysis && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getIntentIcon(analysis.intent)}
                  <span className="font-semibold text-green-800 capitalize">
                    {analysis.intent}
                  </span>
                </div>
                <div className="flex gap-2">
                  {analysis.entities.map((entity: string, index: number) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
              {analysis.filters.length > 0 && (
                <div className="flex gap-2">
                  {analysis.filters.map((filter: string, index: number) => (
                    <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      {filter}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Toggle */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {showDebug ? "Masquer les détails" : "Afficher l'analyse"}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Search className="w-5 h-5" />
              Résultats intelligents pour : "{lastQuery}"
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
                        {result.score && result.score > 1.0 && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Score: {result.score.toFixed(1)}
                          </span>
                        )}
                      </div>
                      
                      {/* Description intelligente */}
                      {result.description && (
                        <p className="text-slate-600 mb-3">{result.description}</p>
                      )}
                      
                      {/* Informations contextuelles */}
                      <div className="flex flex-wrap gap-3">
                        {result.calories && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 text-orange-800">
                            <Activity className="w-4 h-4" />
                            <span className="text-sm font-medium">{result.calories} calories</span>
                          </div>
                        )}
                        {result.indexGlycémique && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-800">
                            <Scale className="w-4 h-4" />
                            <span className="text-sm font-medium">IG: {result.indexGlycémique}</span>
                          </div>
                        )}
                        {result.fibres && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-800">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">{result.fibres}g fibres</span>
                          </div>
                        )}
                        {result.sodium && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-100 text-purple-800">
                            <Droplets className="w-4 h-4" />
                            <span className="text-sm font-medium">{result.sodium}mg sodium</span>
                          </div>
                        )}
                        {/* Informations personne */}
                        {result.âge && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-100 text-pink-800">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">{result.âge} ans</span>
                          </div>
                        )}
                        {result.poids && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-100 text-indigo-800">
                            <Scale className="w-4 h-4" />
                            <span className="text-sm font-medium">{result.poids} kg</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg font-semibold">Analyse intelligente en cours...</p>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Compréhension du contexte et génération de requête optimisée
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {showDebug && analysis && (
        <Card className="bg-slate-50 border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
              <Sparkles className="w-4 h-4" />
              Analyse Intelligente Détaillée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <Label className="text-slate-600">Question originale :</Label>
                <p className="font-mono bg-white p-3 rounded border mt-1 text-slate-800">{lastQuery}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-600">Intention détectée :</Label>
                  <p className="mt-1 font-medium capitalize">{analysis.intent}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Entités identifiées :</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.entities.map((entity: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs capitalize">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {analysis.filters.length > 0 && (
                <div>
                  <Label className="text-slate-600">Filtres contextuels :</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.filters.map((filter: string, index: number) => (
                      <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs capitalize">
                        {filter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {analysis.context && (
                <div>
                  <Label className="text-slate-600">Contexte détecté :</Label>
                  <div className="mt-2 space-y-2">
                    {analysis.context.time_context && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">
                        Temps: {analysis.context.time_context}
                      </span>
                    )}
                    {analysis.context.goal_context && analysis.context.goal_context.length > 0 && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-2">
                        Objectifs: {analysis.context.goal_context.join(', ')}
                      </span>
                    )}
                    {analysis.context.restriction_context && analysis.context.restriction_context.length > 0 && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                        Restrictions: {analysis.context.restriction_context.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}