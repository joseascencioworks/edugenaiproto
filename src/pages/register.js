import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push('/generator')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#eef1f6] flex flex-col justify-center items-center px-4 py-12">
      {/* SICEUC Branding Box */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <img
              src="/Logo_de_la_Universidad_de_Colima.png"
              alt="Universidad de Colima"
              className="w-12 h-12 object-contain"
            />
          </div>

          <h1 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-serif">
            UNIVERSIDAD DE COLIMA
          </h1>
          <h2 className="text-xl font-black text-[#232368] mt-1">
            SICEUC <span className="font-medium text-slate-400">· EdugenIA</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registro de Cuenta Docente
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#232368] mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="nombre@ucol.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#232368] mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-xs uppercase tracking-wider font-bold mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            ¿Ya tienes una cuenta?{' '}
            <Link
              href="/login"
              className="font-bold text-[#1c335d] hover:text-[#232368] hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}