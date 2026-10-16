// src/pages/activities.js
import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSession, getActivities, deleteActivity } from '@/lib/db'
import Layout from '@/components/Layout'
import ActivityCard from '@/components/ActivityCard'
import toast from 'react-hot-toast'
import { Plus, FileText } from 'lucide-react'

const FILTERS = ['Todas', 'Cuestionario', 'Mapa Mental', 'Ensayo', 'Caso', 'Ejercicios']

export default function Activities() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [acts, setActs] = useState([])
  const [filter, setFilter] = useState('Todas')

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace('/login')
      return
    }
    setUser(session)
    getActivities(session.uid).then(setActs)
  }, [router])

  function handleDelete(id) {
    if (!confirm('¿Eliminar esta actividad?')) return
    deleteActivity(id)
    setActs((prev) => prev.filter((a) => (a.firestoreId || a.id) !== id))
    toast.success('Actividad eliminada')
  }

  const shown = filter === 'Todas' ? acts : acts.filter((a) => a.type === filter)

  return (
    <Layout user={user} active="activities">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-[#232368]">
            Mis Actividades
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eceafc] text-[#2b3085]">
            {acts.length}
          </span>
        </div>

        <button
          onClick={() => router.push('/generator')}
          className="btn-primary text-xs self-start sm:self-auto inline-flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Nueva Actividad</span>
        </button>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
              filter === f
                ? 'bg-[#1c335d] border-[#1c335d] text-white shadow-sm'
                : 'bg-white border-slate-200 text-[#232368] hover:border-[#1c335d]/40 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content Grid or Empty State */}
      {shown.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f1f3f7] flex items-center justify-center text-[#232368]">
            <FileText size={26} />
          </div>
          <p className="font-bold text-[#232368] text-base">
            Sin actividades encontradas
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            {filter === 'Todas'
              ? 'Aún no tienes actividades registradas. Puedes generar una con el asistente de IA.'
              : `No se encontraron actividades con el filtro "${filter}".`}
          </p>
          <button
            onClick={() => router.push('/generator')}
            className="btn-primary text-xs mt-2"
          >
            Generar actividad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((act) => (
            <ActivityCard
              key={act.firestoreId || act.id}
              activity={act}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}
