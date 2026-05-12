// src/pages/dashboard.js
import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSession, getActivities, deleteActivity } from '@/lib/db'
import Layout from '@/components/Layout'
import ActivityCard from '@/components/ActivityCard'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser]             = useState(null)
  const [activities, setActivities] = useState([])

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/login'); return }
    setUser(session)
    getActivities(session.uid)
  .then(setActivities)
  }, [router])

  function handleDelete(id) {
    if (!confirm('¿Eliminar esta actividad?')) return
    deleteActivity(id)
    setActivities(prev => prev.filter(a => a.id !== id))
    toast.success('Eliminada')
  }

  const counts = {
    total: activities.length,
    quiz:  activities.filter(a => a.type === 'Cuestionario').length,
    essay: activities.filter(a => ['Ensayo','Ejercicios'].includes(a.type)).length,
    other: activities.filter(a => ['Mapa Mental','Caso'].includes(a.type)).length,
  }
  const stats = [
    { label:'Total',          value:counts.total, emoji:'', bg:'#eff6ff' },
    { label:'Cuestionarios',  value:counts.quiz,  emoji:'', bg:'#f0fdf4' },
    { label:'Ensayos',        value:counts.essay, emoji:'', bg:'#fdf4ff' },
    { label:'Mapas & Casos',  value:counts.other, emoji:'', bg:'#fff7ed' },
  ]

  return (
    <Layout user={user} active="dashboard">
      {/* Banner */}
      <div className="rounded-2xl p-7 mb-6 relative overflow-hidden flex items-center justify-between"
        style={{ background:'linear-gradient(135deg,#1e3a8a,#312e81,#1e1b4b)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:'radial-gradient(ellipse 60% 80% at 80% 50%,rgba(124,58,237,.25) 0,transparent 60%)' }} />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white mb-1">
            ¡Hola, {user?.name?.split(' ')[0] ?? 'Docente'}! 
          </h1>
          <p className="text-blue-200 text-sm">Crea actividades educativas con el poder de la IA</p>
        </div>
        <button onClick={() => router.push('/generator')}
          className="relative flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold text-sm px-4 py-3 rounded-xl hover:bg-white/20 transition-all flex-shrink-0">
          Nueva Actividad
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, emoji, bg }) => (
          <div key={label} className="card p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3" style={{ background:bg }}>{emoji}</div>
            <div className="text-2xl font-extrabold text-gray-900">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900">Actividades Recientes</h2>
        <button onClick={() => router.push('/activities')}
          className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
          Ver todas →
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
          <span className="text-4xl"></span>
          <p className="font-bold text-gray-700">Sin actividades todavía</p>
          <p className="text-sm text-gray-400"></p>
          <button onClick={() => router.push('/generator')} className="btn-primary mt-1">Crear actividad</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {activities.slice(0, 6).map(act => (
            <ActivityCard key={act.id} activity={act} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </Layout>
  )
}
