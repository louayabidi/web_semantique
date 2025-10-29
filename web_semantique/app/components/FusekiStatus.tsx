"use client"

import { useEffect, useState } from "react"

export function FusekiStatus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        setStatus({ error: "Backend not accessible" })
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Vérification de la connexion...</div>

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold mb-2">État du système</h3>
      <div className="space-y-1 text-sm">
        <div>
          Backend:{" "}
          <span className={status?.backend === "ok" ? "text-green-600" : "text-red-600"}>
            {status?.backend || "erreur"}
          </span>
        </div>
        <div>
          Fuseki:{" "}
          <span className={status?.fuseki === "ok" ? "text-green-600" : "text-red-600"}>
            {status?.fuseki || "erreur"}
          </span>
        </div>
        <div className="text-xs text-gray-600 mt-2">URL: {status?.fuseki_url}</div>
      </div>
    </div>
  )
}
