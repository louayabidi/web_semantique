"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext"; // Adjust path
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonneManager from "@/components/PersonneManager";
import AlimentManager from "@/components/AlimentManager";
import ActiviteManager from "@/components/ActiviteManager";
import NutrimentManager from "../components/NutrimentManager";
import ConditionManager from "../components/ConditionManager";
import AllergieManager from "../components/AllergieManager";
import ObjectifManager from "../components/ObjectifManager";
import RecetteManager from "../components/RecetteManager";
import RepasManager from "../components/RepasManager";
import ProgrammeManager from "../components/ProgrammeManager";
import PreferenceManager from "../components/PreferenceManager";
import RecommandationManager from "@/components/RecommandationManager";
import SearchPanel from "@/components/SearchPanel";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null; // Or a loading spinner

  // Define all possible tabs
  const allTabs = [
    { value: "dashboard", label: "Tableau de Bord", component: <Dashboard /> },
    { value: "personnes", label: "Personnes", component: <PersonneManager /> },
    { value: "aliments", label: "Aliments", component: <AlimentManager /> },
    { value: "activites", label: "Activités", component: <ActiviteManager /> },
    { value: "nutriments", label: "Nutriments", component: <NutrimentManager /> },
    { value: "conditions", label: "Conditions", component: <ConditionManager /> },
    { value: "allergies", label: "Allergies", component: <AllergieManager /> },
    { value: "objectifs", label: "Objectifs", component: <ObjectifManager /> },
    { value: "recettes", label: "Recettes", component: <RecetteManager /> },
    { value: "repas", label: "Repas", component: <RepasManager /> },
    { value: "programmes", label: "Programmes", component: <ProgrammeManager /> },
    { value: "preferences", label: "Préférences", component: <PreferenceManager /> },
    { value: "recommandations", label: "Recommandations", component: <RecommandationManager /> },
    { value: "search", label: "Recherche", component: <SearchPanel /> },
  ];

  // Filter tabs based on role
  let visibleTabs = allTabs;
  if (user.role === "user") {
    visibleTabs = allTabs.filter(tab => 
      ["dashboard", "personnes", "aliments", "activites", "recettes", "repas", "preferences", "recommandations", "search"].includes(tab.value)
    );
  } else if (user.role === "psychology") {
    visibleTabs = allTabs.filter(tab => 
      ["dashboard", "personnes", "conditions", "allergies", "objectifs", "programmes", "preferences", "recommandations", "search"].includes(tab.value)
    );
  }
  // Admin sees all by default

  // Split into two rows if too many (like your original)
  const firstRow = visibleTabs.slice(0, 7);
  const secondRow = visibleTabs.slice(7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Système de Recommandation Nutritionnel</h1>
          <div className="flex items-center">
            <span className="mr-4">Bienvenue, {user.username} ({user.role})</span>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-md">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 overflow-x-auto">
            {firstRow.map(tab => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
          </TabsList>

          {secondRow.length > 0 && (
            <TabsList className="grid w-full grid-cols-7 mb-8">
              {secondRow.map(tab => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
            </TabsList>
          )}

          {visibleTabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}