import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getActivities, deleteActivity } from '@/lib/db'
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
  User,
  Shield,
  School,
  Hash,
  Calendar,
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [activities, setActivities] = useState([])
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    let active = true

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) return

      if (!firebaseUser) {
        setUser(null)
        setCheckingAuth(false)
        router.replace('/login')
        return
      }

      setUser({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Docente',
        email: firebaseUser.email,
      })

      try {
        const result = await getActivities(firebaseUser.uid)

        if (active) {
          setActivities(result)
        }
      } catch (error) {
        console.error('Error al cargar actividades:', error)

        if (active) {
          toast.error('No se pudieron cargar las actividades.')
        }
      } finally {
        if (active) {
          setCheckingAuth(false)
        }
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [router])

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta actividad?')) return

    try {
      await deleteActivity(id)

      setActivities((prev) =>
        prev.filter((activity) => activity.firestoreId !== id)
      )

      toast.success('Actividad eliminada')
    } catch (error) {
      console.error('Error al eliminar actividad:', error)
      toast.error('No se pudo eliminar la actividad.')
    }
  }

  const counts = {
    total: activities.length,
    quiz: activities.filter((a) => a.type === 'Cuestionario').length,
    essay: activities.filter((a) => ['Ensayo', 'Ejercicios'].includes(a.type)).length,
    other: activities.filter((a) => ['Mapa Mental', 'Caso'].includes(a.type)).length,
  }

  const stats = [
    { label: 'Total de Actividades', value: counts.total, icon: Layers, bg: '#f1f3f7' },
    { label: 'Cuestionarios', value: counts.quiz, icon: CheckCircle2, bg: '#f1f3f7' },
    { label: 'Ensayos y Ejercicios', value: counts.essay, icon: Award, bg: '#f1f3f7' },
    { label: 'Mapas y Casos', value: counts.other, icon: BookOpen, bg: '#f1f3f7' },
  ]

  if (checkingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef1f6]">
        <div className="text-center">
          <div className="w-9 h-9 border-3 border-[#1c335d] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#1e2554] tracking-wide">
            Cargando portal SICEUC...
          </p>
        </div>
      </div>
    )
  }

  const workerId = user.uid ? user.uid.replace(/[^0-9]/g, '').slice(0, 8) || '20190922' : '20190922'

  return (
    <Layout user={user} active="dashboard">
      {/* Upper Section: Credential Card & Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Left: SICEUC Credential Card */}
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
                FACULTAD DE TELEMÁTICA
              </p>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            {/* Account Badge Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eceafc] text-[#2b3085] text-xs font-bold">
              <span>✦</span>
              <span>Número de cuenta / ID: {workerId}</span>
            </div>

            {/* Info Rows */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f1f3f7] flex items-center justify-center text-[#4a5568] shrink-0">
                  <User size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    CORREO ELECTRÓNICO
                  </p>
                  <p className="text-xs font-bold text-[#1e2554] truncate">
                    {user.email || 'correo@ucol.mx'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f1f3f7] flex items-center justify-center text-[#4a5568] shrink-0">
                  <School size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    PLANTEL
                  </p>
                  <p className="text-xs font-bold text-[#1e2554] truncate">
                    FACULTAD DE TELEMÁTICA · UNIVERSIDAD DE COLIMA
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f1f3f7] flex items-center justify-center text-[#4a5568] shrink-0">
                  <Shield size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ÁREA / CARRERA
                  </p>
                  <p className="text-xs font-bold text-[#1e2554] truncate">
                    INGENIERÍA DE SOFTWARE / DOCENCIA E INVESTIGACIÓN
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>Ciclo escolar: AGO-2026 / ENE-2027</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Hash size={13} className="text-slate-400" />
                <span>Estatus: <strong className="text-emerald-700 font-bold">Activo</strong></span>
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
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#232368] group-hover:translate-x-1 transition-all shrink-0" />
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
              <ArrowRight size={16} className="text-slate-400 group-hover:text-[#232368] group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Lower Section: "Más opciones" (Stats Cards in SICEUC style) */}
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

        {activities.length === 0 ? (
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
                key={activity.firestoreId}
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
