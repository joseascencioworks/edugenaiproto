import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  LogOut,
  Mail,
  Calendar,
  Briefcase,
  Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { clearSession } from '@/lib/session'

const NAV = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/generator', label: 'Generar', icon: Sparkles, key: 'generator' },
  { href: '/activities', label: 'Mis Actividades', icon: FileText, key: 'activities' },
]

function UColimaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/Logo_de_la_Universidad_de_Colima.png"
        alt="Universidad de Colima"
        className="w-9 h-9 object-contain shrink-0"
      />
      <div className="flex flex-col leading-none">
        <span className="text-[11px] font-extrabold tracking-wider text-[#1e2554] uppercase font-serif">
          UNIVERSIDAD
        </span>
        <span className="text-[9px] font-bold tracking-widest text-[#1e2554] uppercase font-serif mt-0.5">
          DE COLIMA
        </span>
      </div>
    </div>
  )
}

export default function Layout({ children, user, active }) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    if (loggingOut) return

    setLoggingOut(true)

    try {
      try {
        clearSession()
      } catch (e) {}
      await signOut(auth)
      toast.success('Sesión cerrada correctamente')
      await router.replace('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('No se pudo cerrar la sesión')
      setLoggingOut(false)
    }
  }

  const displayName = user?.name || 'Docente'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#eef1f6] flex flex-col text-[#1e2554]">
      {/* 1. SICEUC Top Utility Bar (White) */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Left: UColima Crest and Brand */}
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <UColimaLogo />
          </Link>

          {/* Center: SICEUC Portal Identity */}
          <div className="text-center">
            <span className="text-sm sm:text-base font-extrabold tracking-widest text-[#232368] font-sans">
              SICEUC
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-slate-400">
              · EdugenIA
            </span>
          </div>

          {/* Right: Quick Action Icons & Logout */}
          <div className="flex items-center gap-3 sm:gap-4 text-slate-500">
            <button
              type="button"
              title="Notificaciones / Correo"
              className="p-1 hover:text-[#232368] transition-colors"
              onClick={() => toast('No hay mensajes nuevos')}
            >
              <Mail size={17} />
            </button>
            <button
              type="button"
              title="Calendario"
              className="p-1 hover:text-[#232368] transition-colors"
              onClick={() => toast('Calendario escolar AGO-2026 / ENE-2027')}
            >
              <Calendar size={17} />
            </button>
            <button
              type="button"
              title="Portafolio Docente"
              className="p-1 hover:text-[#232368] transition-colors"
              onClick={() => router.push('/activities')}
            >
              <Briefcase size={17} />
            </button>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              title="Cerrar sesión"
              aria-label="Logout"
              className="p-1 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <LogOut size={17} />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. SICEUC Sub-Header (Dark Navy/Teal Banner) */}
      <section className="w-full bg-gradient-to-r from-[#103847] via-[#163252] to-[#1c335d] text-white relative shadow-sm">
        {/* Subtle decorative curved background shapes matching SICEUC banner */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-[#4e5285]/40 blur-xl" />
          <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-[#134050]/50 blur-xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          {/* User Profile Badge (Left) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#203a5b] border-2 border-white/40 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
              {initial}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white truncate leading-snug">
                {displayName}
              </h2>
              <p className="text-[10px] sm:text-[11px] font-semibold text-[#5eead4] uppercase tracking-wider">
                FACULTAD DE TELEMÁTICA · DOCENTE
              </p>
            </div>
          </div>

          {/* Navigation Links (Right) */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-1 md:pb-0">
            <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-[13px] font-medium whitespace-nowrap">
              {NAV.map(({ href, label, key }) => {
                const isActive = active === key
                return (
                  <Link
                    key={key}
                    href={href}
                    className={`py-1 transition-all ${
                      isActive
                        ? 'text-[#5eead4] font-bold border-b-2 border-[#5eead4]'
                        : 'text-slate-200/90 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>

            <button
              type="button"
              onClick={() => router.push('/generator')}
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all shrink-0"
            >
              <Plus size={13} />
              <span>Nueva Actividad</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Main Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* SICEUC Footer Bar */}
      <footer className="w-full bg-white border-t border-slate-200/70 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© Universidad de Colima · EdugenIA · Sistema Integral de Gestión Educativa con Inteligencia Artificial</p>
        </div>
      </footer>
    </div>
  )
}
