import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { getActivities, deleteActivity } from '@/lib/db'
import { useAuth } from '@/lib/useAuth'
import Layout from '@/components/Layout'
import ActivityCard from '@/components/ActivityCard'
import toast from 'react-hot-toast'
import {
  Sparkles,
  FileText,
  CheckCircle2,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  Hash,
  Loader2,
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const { user, checkingAuth } = useAuth({ requireAuth: true, redirectTo: '/login' })

  const [activities, setActivities] = useState([])
  const [loadingActivities, setLoadingActivities] = useState(true)

  // Cargar actividades cuando el usuario esté disponible
  useEffect(() => {
    if (!user?.uid) return

    let active = true

    getActivities(user.uid)
      .then((data) => {
        if (active) {
          setActivities(data)
          setLoadingActivities(false)
        }
      })
      .catch((error) => {
        console.error('Error al cargar actividades:', error)
        if (active) {
          toast.error('No se pudieron cargar las actividades.')
          setLoadingActivities(false)
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
      setActivities((prev) =>
        prev.filter((activity) => (activity.firestoreId || activity.id) !== id)
      )
      toast.success('Actividad eliminada')
    } catch (error) {
      console.error('Error al eliminar actividad:', error)
      toast.error('No se pudo eliminar la actividad.')
    }
  }

  const counts = useMemo(() => {
    return {
      total: activities.length,
      quiz: activities.filter((a) => a.type === 'Cuestionario').length,
      essay: activities.filter((a) => ['Ensayo', 'Ejercicios'].includes(a.type)).length,
      other: activities.filter((a) => ['Mapa Mental', 'Caso'].includes(a.type)).length,
    }
  }, [activities])

  const stats = useMemo(() => [
    { label: 'Total de Actividades', value: counts.total, icon: Layers, bg: '#f1f3f7' },
    { label: 'Cuestionarios', value: counts.quiz, icon: CheckCircle2, bg: '#f1f3f7' },
    { label: 'Ensayos y Ejercicios', value: counts.essay, icon: Award, bg: '#f1f3f7' },
    { label: 'Mapas y Casos', value: counts.other, icon: BookOpen, bg: '#f1f3f7' },
  ], [counts])

  if (checkingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef1f6]">
        <div className="text-center">
          <div className="w-9 h-9 border-3 border-[#1c335d] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#1e2554] tracking-wide">
            Cargando EdugenAI ...
          </p>
        </div>
      </div>
    )
  }

  const workerId = user.uid ? user.uid.replace(/[^0-9]/g, '').slice(0, 8) || '20190922' : '20190922'
  const isUserActive = (user.status || 'Activo').toLowerCase() === 'activo'

  return (
    <Layout user={user} active="dashboard">
      {/* Upper Section: Credential Card & Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Left: Credential Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Top Banner Gradient */}
          <div className="bg-gradient-to-r from-[#133a4c] via-[#1b3558] to-[#252f5c] px-6 py-5 text-white flex items-center gap-4 relative">
            <div className="w-16 h-16 rounded-full bg-[#203a5b] border-2 border-white/60 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-white truncate leading-tight">
                {user.name}
              </h2>
              <p className="text-xs font-medium text-[#5eead4] uppercase tracking-wider mt-0.5">
                DOCENTE
              </p>
            </div>
          </div>

          {/* Card Body: Only ID and Status */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account / ID Box */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#f8fafc] border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#eceafc] flex items-center justify-center text-[#2b3085] shrink-0 font-bold">
                  <Hash size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Número de cuenta / ID
                  </p>
                  <p className="text-sm font-extrabold text-[#1e2554] truncate">
                    {workerId}
                  </p>
                </div>
              </div>

              {/* Status Box */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#f8fafc] border border-slate-100">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUserActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Estatus
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isUserActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <span
                      className={`text-sm font-extrabold ${
                        isUserActive ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {isUserActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Acciones Recomendadas */}
        <div className="lg:col-span-5 flex flex-col">
          <h2 className="text-lg font-bold text-[#232368] mb-4 text-center lg:text-left">
            Acciones recomendadas
          </h2>

          <div className="flex flex-col gap-3.5">
            <button
              type="button"
              onClick={() => router.push('/generator')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#1c335d]/30 transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#f1f3f7] group-hover:bg-[#eceafc] flex items-center justify-center text-[#232368] shrink-0 transition-colors">
                <Sparkles size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#232368] group-hover:text-[#1c335d] transition-colors">
                  Generar nueva actividad con IA
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cuestionarios, exámenes, ensayos y ejercicios
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-slate-400 group-hover:text-[#232368] group-hover:translate-x-1 transition-all shrink-0"
              />
            </button>

            <button
              type="button"
              onClick={() => router.push('/activities')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#1c335d]/30 transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#f1f3f7] group-hover:bg-[#eceafc] flex items-center justify-center text-[#232368] shrink-0 transition-colors">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#232368] group-hover:text-[#1c335d] transition-colors">
                  Mis actividades guardadas
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizar, exportar a DOC / PDF o eliminar
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-slate-400 group-hover:text-[#232368] group-hover:translate-x-1 transition-all shrink-0"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Lower Section: "Más opciones" */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#232368] text-center mb-5">
          Más opciones
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-[#232368] mb-3"
                style={{ backgroundColor: bg }}
              >
                <Icon size={22} />
              </div>
              <div className="text-2xl font-black text-[#232368]">
                {value}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#232368]">
            Actividades Recientes
          </h2>

          <button
            onClick={() => router.push('/activities')}
            className="text-xs font-bold text-[#1c335d] hover:text-[#232368] hover:underline transition-colors flex items-center gap-1"
          >
            <span>Ver todas</span>
            <span>→</span>
          </button>
        </div>

        {loadingActivities ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
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
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f1f3f7] flex items-center justify-center text-[#232368]">
              <FileText size={24} />
            </div>
            <p className="font-bold text-[#232368] text-sm">
              Sin actividades todavía
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Comienza generando cuestionarios, exámenes o ejercicios educativos con IA adaptados a tu materia.
            </p>
            <button
              onClick={() => router.push('/generator')}
              className="btn-primary text-xs mt-2"
            >
              Crear primera actividad
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.slice(0, 6).map((activity) => (
              <ActivityCard
                key={activity.firestoreId || activity.id}
                activity={activity}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}
