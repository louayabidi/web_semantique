"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PersonneManager from "@/components/PersonneManager"
import AlimentManager from "@/components/AlimentManager"
import ActiviteManager from "@/components/ActiviteManager"
import NutrimentManager from "../components/NutrimentManager"
import ConditionManager from "../components/ConditionManager"
import AllergieManager from "../components/AllergieManager"
import ObjectifManager from "../components/ObjectifManager"
import RecetteManager from "../components/RecetteManager"
import RepasManager from "../components/RepasManager"
import ProgrammeManager from "../components/ProgrammeManager"
import PreferenceManager from "../components/PreferenceManager"
import RecommandationManager from "@/components/RecommandationManager"
import SearchPanel from "@/components/SearchPanel"
import Dashboard from "@/components/Dashboard"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Système de Recommandation Nutritionnel</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 overflow-x-auto">
            <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
            <TabsTrigger value="personnes">Personnes</TabsTrigger>
            <TabsTrigger value="aliments">Aliments</TabsTrigger>
            <TabsTrigger value="activites">Activités</TabsTrigger>
            <TabsTrigger value="nutriments">Nutriments</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="allergies">Allergies</TabsTrigger>
          </TabsList>

          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="objectifs">Objectifs</TabsTrigger>
            <TabsTrigger value="recettes">Recettes</TabsTrigger>
            <TabsTrigger value="repas">Repas</TabsTrigger>
            <TabsTrigger value="programmes">Programmes</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
            <TabsTrigger value="recommandations">Recommandations</TabsTrigger>
            <TabsTrigger value="search">Recherche</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="personnes">
            <PersonneManager />
          </TabsContent>

          <TabsContent value="aliments">
            <AlimentManager />
          </TabsContent>

          <TabsContent value="activites">
            <ActiviteManager />
          </TabsContent>

          <TabsContent value="nutriments">
            <NutrimentManager />
          </TabsContent>

          <TabsContent value="conditions">
            <ConditionManager />
          </TabsContent>

          <TabsContent value="allergies">
            <AllergieManager />
          </TabsContent>

          <TabsContent value="objectifs">
            <ObjectifManager />
          </TabsContent>

          <TabsContent value="recettes">
            <RecetteManager />
          </TabsContent>

          <TabsContent value="repas">
            <RepasManager />
          </TabsContent>

          <TabsContent value="programmes">
            <ProgrammeManager />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferenceManager />
          </TabsContent>

          <TabsContent value="recommandations">
            <RecommandationManager />
          </TabsContent>

          <TabsContent value="search">
            <SearchPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
