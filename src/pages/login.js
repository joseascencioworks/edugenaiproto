// src/pages/login.js
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { setSession, getSession } from '@/lib/db'
import toast from 'react-hot-toast'

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('edugenai_users') || '{}')
  } catch {
    return {}
  }
}

function saveUsers(u) {
  localStorage.setItem('edugenai_users', JSON.stringify(u))
}

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (getSession()) router.replace('/dashboard')
  }, [router])

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.email || !form.password) {
      toast.error('Completa todos los campos')
      return
    }

    if (!form.email.includes('@')) {
      toast.error('Correo inválido')
      return
    }

    if (form.password.length < 6) {
      toast.error('Contraseña mínimo 6 caracteres')
      return
    }

    setLoading(true)

    const users = getUsers()

    // 🔹 LOGIN
    if (tab === 'login') {
      let user = users[form.email]

      // 👉 si no existe, lo creamos automáticamente (modo demo)
      if (!user) {
        user = {
          uid: `u_${Date.now()}`,
          name: 'Usuario',
          password: form.password,
        }
        users[form.email] = user
        saveUsers(users)
      }

      if (user.password !== form.password) {
        toast.error('Contraseña incorrecta')
        setLoading(false)
        return
      }

      setSession({
        uid: user.uid,
        name: user.name,
        email: form.email,
      })

      router.replace('/dashboard')
    }

    // 🔹 REGISTER
    else {
      if (!form.name.trim()) {
        toast.error('Ingresa tu nombre')
        setLoading(false)
        return
      }

      if (users[form.email]) {
        toast.error('El correo ya está registrado')
        setLoading(false)
        return
      }

      const uid = `u_${Date.now()}`

      users[form.email] = {
        uid,
        name: form.name,
        password: form.password,
      }

      saveUsers(users)

      setSession({
        uid,
        name: form.name,
        email: form.email,
      })

      toast.success('¡Cuenta creada!')
      router.replace('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-center">
          {tab === 'login' ? 'Login' : 'Registro'}
        </h2>

        <div className="flex mb-4">
          <button onClick={() => setTab('login')} className="flex-1">
            Login
          </button>
          <button onClick={() => setTab('register')} className="flex-1">
            Registro
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <input
              placeholder="Nombre"
              value={form.name}
              onChange={set('name')}
              className="w-full mb-2 p-2 border"
            />
          )}

          <input
            placeholder="Correo"
            value={form.email}
            onChange={set('email')}
            className="w-full mb-2 p-2 border"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={set('password')}
            className="w-full mb-2 p-2 border"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2"
          >
            {loading ? 'Cargando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  )
}