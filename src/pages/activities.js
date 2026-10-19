// src/pages/activities.js
import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { getActivities, deleteActivity } from '@/lib/db'
import { useAuth } from '@/lib/useAuth'
import Layout from '@/components/Layout'
import ActivityCard from '@/components/ActivityCard'
import toast from 'react-hot-toast'
import { Plus, FileText } from 'lucide-react'

const FILTERS = ['Todas', 'Cuestionario', 'Mapa Mental', 'Ensayo', 'Caso', 'Ejercicios']

export default function Activities() {
  const router = useRouter()
  const { user, checkingAuth } = useAuth({ requireAuth: true, redirectTo: '/login' })

  const [acts, setActs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Todas')

  useEffect(() => {
    if (!user?.uid) return
    let active = true

    getActivities(user.uid)
      .then((data) => {
        if (active) {
          setActs(data)
          setLoading(false)
        }
      })
      .catch((error) => {
        console.error('Error al obtener actividades:', error)
        if (active) {
          toast.error('Error al cargar actividades')
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [user?.uid])

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta actividad?')) return

    try {
      await deleteActivity(id, user?.uid)
      setActs((prev) => prev.filter((a) => (a.firestoreId || a.id) !== id))
      toast.success('Actividad eliminada')
    } catch (error) {
      console.error('Error al eliminar actividad:', error)
      toast.error('No se pudo eliminar la actividad')
    }
  }

  const shown = useMemo(() => {
    if (filter === 'Todas') return acts
    return acts.filter((a) => a.type === filter)
  }, [acts, filter])

  if (checkingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef1f6]">
        <div className="text-center">
          <div className="w-9 h-9 border-3 border-[#1c335d] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#1e2554] tracking-wide">
            Cargando actividades...
          </p>
        </div>
      </div>
    )
  }

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
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200/70 p-5 animate-pulse h-44 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <div className="w-24 h-5 bg-slate-100 rounded-full" />
                <div className="w-14 h-4 bg-slate-100 rounded" />
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-4 bg-slate-100 rounded" />
                <div className="w-1/2 h-3 bg-slate-100 rounded" />
              </div>
              <div className="w-full h-8 bg-slate-50 rounded-lg" />
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
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
