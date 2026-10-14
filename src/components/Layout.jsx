
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { LayoutDashboard, Sparkles, FileText, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/generator', label: 'Generar', icon: Sparkles, key: 'generator' },
  { href: '/activities', label: 'Mis Actividades', icon: FileText, key: 'activities' },
]

export default function Layout({ children, user, active }) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    if (loggingOut) return

    setLoggingOut(true)

    try {
      await signOut(auth)
      toast.success('Sesión cerrada correctamente')
      await router.replace('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('No se pudo cerrar la sesión')
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100 flex flex-col z-50 shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <span className="font-bold text-xl text-gray-900">
            Edu<span className="text-blue-600">Gen</span>AI
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, key }) => (
            <Link
              key={key}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === key
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'D'}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate">
              {user?.name ?? 'Docente'}
            </p>
            <p className="text-[11px] text-gray-400">Profesor(a)</p>
          </div>

          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col ml-56">
        <header className="h-[60px] bg-white border-b border-gray-100 flex items-center px-7 sticky top-0 z-40">
          <h1 className="flex-1 text-[15px] font-bold text-gray-900">
            {NAV.find((n) => n.key === active)?.label ?? 'EduGenAI'}
          </h1>

          <button
            type="button"
            onClick={() => router.push('/generator')}
            className="btn-primary text-xs"
          >
            Nueva Actividad
          </button>
        </header>

        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  )
}
