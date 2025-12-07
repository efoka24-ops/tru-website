import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import { servicesAPI, contentAPI, teamAPI } from '../services/api'
import { Package, FileText, Users } from 'lucide-react'
import './Dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState({ services: 0, content: 0, team: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [servicesRes, contentRes, teamRes] = await Promise.all([
        servicesAPI.getAll(),
        contentAPI.getAll(),
        teamAPI.getAll()
      ])
      setStats({
        services: servicesRes.data.length,
        content: contentRes.data.length,
        team: teamRes.data.length
      })
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ background: color + '20', color }}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  )

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Tableau de bord</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="stats-grid">
          <StatCard icon={Package} title="Services" value={stats.services} color="#0d7377" />
          <StatCard icon={FileText} title="Contenus" value={stats.content} color="#14a085" />
          <StatCard icon={Users} title="Équipe" value={stats.team} color="#00a693" />
        </div>
      )}

      <Card title="Bienvenue" style={{ marginTop: '30px' }}>
        <p>Bienvenue dans le back office de Site TRU. Vous pouvez gérer tous les contenus du site à partir de ce tableau de bord.</p>
        <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
          <li>Gérez vos services et leurs descriptions</li>
          <li>Mettez à jour le contenu des pages</li>
          <li>Administrez l'équipe</li>
        </ul>
      </Card>
    </div>
  )
}
