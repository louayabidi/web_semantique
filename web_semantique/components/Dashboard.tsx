"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Apple, Activity, Target } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState({
    personnes: 0,
    aliments: 0,
    activites: 0,
    recommandations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [personnesRes, alimentsRes, activitesRes, recsRes] = await Promise.all([
        fetch("http://localhost:5000/api/personnes"),
        fetch("http://localhost:5000/api/aliments"),
        fetch("http://localhost:5000/api/activites"),
        fetch("http://localhost:5000/api/recommandations"),
      ])

      const personnes = await personnesRes.json()
      const aliments = await alimentsRes.json()
      const activites = await activitesRes.json()
      const recommandations = await recsRes.json()

      setStats({
        personnes: personnes.length,
        aliments: aliments.length,
        activites: activites.length,
        recommandations: recommandations.length,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
    setLoading(false)
  }

  const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
    <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-extrabold text-primary">{value}</p>
          </div>
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent text-accent-foreground">
            <Icon className="w-7 h-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const StatCardLoading = () => (
    <div className="rounded-lg border border-slate-100 bg-white/60 p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-20 h-4 bg-slate-200 rounded" />
          <div className="w-12 h-8 bg-slate-200 rounded" />
        </div>
        <div className="w-12 h-12 rounded-full bg-slate-200" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => <StatCardLoading key={i} />)
        ) : (
          <>
            <StatCard icon={Users} label="Personnes" value={stats.personnes} />
            <StatCard icon={Apple} label="Aliments" value={stats.aliments} />
            <StatCard icon={Activity} label="Activités" value={stats.activites} />
            <StatCard icon={Target} label="Recommandations" value={stats.recommandations} />
          </>
        )}
      </div>

      <Card className="rounded-lg border border-slate-100 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl text-primary">Bienvenue au tableau de bord</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bienvenue au tableau de bord — ici vous pouvez visualiser les principales statistiques et accéder rapidement aux différentes sections pour gérer personnes, aliments, activités et recommandations.</p>
        </CardContent>
      </Card>
    </div>
  )
}
