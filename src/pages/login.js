// src/pages/login.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import { setSession, getSession } from '@/lib/db'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

function getUsers() {
  try { return JSON.parse(localStorage.getItem('edugenai_users') || '{}') } catch { return {} }
}
function saveUsers(u) { localStorage.setItem('edugenai_users', JSON.stringify(u)) }

export default function LoginPage() {
  const router  = useRouter()
  const [tab, setTab]       = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (getSession()) router.replace('/dashboard')
  }, [router])

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Completa todos los campos'); return }
    if (!form.email.includes('@'))     { toast.error('Correo inválido'); return }
    if (form.password.length < 6)      { toast.error('Contraseña mínimo 6 caracteres'); return }

    setLoading(true)
    const users = getUsers()

    if (tab === 'login') {
      const user = users[form.email]
      if (!user)                      { toast.error('Correo no registrado'); setLoading(false); return }
      if (user.password !== form.password) { toast.error('Contraseña incorrecta'); setLoading(false); return }
      setSession({ uid: user.uid, name: user.name, email: form.email })
      router.replace('/dashboard')
    } else {
      if (!form.name.trim())           { toast.error('Ingresa tu nombre'); setLoading(false); return }
      if (users[form.email])           { toast.error('El correo ya está registrado'); setLoading(false); return }
      const uid  = `u_${Date.now()}`
      users[form.email] = { uid, name: form.name, password: form.password }
      saveUsers(users)
      setSession({ uid, name: form.name, email: form.email })
      toast.success('¡Cuenta creada!')
      router.replace('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 20%,rgba(37,99,235,.25) 0,transparent 60%), radial-gradient(ellipse 50% 60% at 80% 80%,rgba(124,58,237,.2) 0,transparent 60%), #0b0f1a' }}>
      <div className="w-full max-w-sm bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xl">📚</div>
          <span className="text-2xl font-bold text-white">Edu<span className="text-blue-400">Gen</span>AI</span>
        </div>
        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
          {['login', 'register'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                ${tab === t ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-300'}`}>
              {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'register' && (
            <input className="w-full px-4 py-3 bg-white/7 border border-white/10 rounded-xl text-slate-200 text-sm placeholder-slate-500 outline-none focus:border-blue-400/50 transition-all"
              placeholder="Nombre completo" value={form.name} onChange={set('name')} />
          )}
          <input className="w-full px-4 py-3 bg-white/7 border border-white/10 rounded-xl text-slate-200 text-sm placeholder-slate-500 outline-none focus:border-blue-400/50 transition-all"
            type="email" placeholder="Correo electrónico" value={form.email} onChange={set('email')} required />
          <input className="w-full px-4 py-3 bg-white/7 border border-white/10 rounded-xl text-slate-200 text-sm placeholder-slate-500 outline-none focus:border-blue-400/50 transition-all"
            type="password" placeholder="Contraseña (mín. 6 caracteres)" value={form.password} onChange={set('password')} required />
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-sm
              hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-60 transition-all mt-1">
            {loading ? 'Cargando…' : (tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta')}
          </button>
        </form>
      </div>
    </div>
  )
}
