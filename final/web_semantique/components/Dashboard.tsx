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
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <Icon className="w-12 h-12 text-slate-300" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="Personnes" value={stats.personnes} />
        <StatCard icon={Apple} label="Aliments" value={stats.aliments} />
        <StatCard icon={Activity} label="Activités" value={stats.activites} />
        <StatCard icon={Target} label="Recommandations" value={stats.recommandations} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenue</CardTitle>
        </CardHeader>
        
      </Card>
    </div>
  )
}
