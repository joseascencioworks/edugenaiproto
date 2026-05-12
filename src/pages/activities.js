// src/pages/activities.js
import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSession, getActivities, deleteActivity } from '@/lib/db'
import Layout from '@/components/Layout'
import ActivityCard from '@/components/ActivityCard'
import toast from 'react-hot-toast'

const FILTERS = ['Todas','Cuestionario','Mapa Mental','Ensayo','Caso','Ejercicios']

export default function Activities() {
  const router = useRouter()
  const [user, setUser]       = useState(null)
  const [acts, setActs]       = useState([])
  const [filter, setFilter]   = useState('Todas')

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/login'); return }
    setUser(session)
    getActivities(session.uid)
  .then(setActs)
  }, [router])

  function handleDelete(id) {
    if (!confirm('¿Eliminar?')) return
    deleteActivity(id)
    setActs(prev => prev.filter(a => a.id !== id))
    toast.success('Eliminada')
  }

  const shown = filter === 'Todas' ? acts : acts.filter(a => a.type === filter)

  return (
    <Layout user={user} active="activities">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-gray-900">
          Mis Actividades
          <span className="ml-2 text-sm font-normal text-gray-400">({acts.length})</span>
        </h1>
        <button onClick={() => router.push('/generator')} className="btn-primary text-xs">Nueva</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-all
              ${filter === f ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            {f}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <span className="text-4xl"></span>
          <p className="font-bold text-gray-700">Sin actividades</p>
          <p className="text-sm text-gray-400">No hay actividades con este filtro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map(act => <ActivityCard key={act.id} activity={act} onDelete={handleDelete} />)}
        </div>
      )}
    </Layout>
  )
}
