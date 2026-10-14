
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'

function getAuthError(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Este correo ya tiene una cuenta.'
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido.'
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.'
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Inténtalo más tarde.'
    case 'auth/network-request-failed':
      return 'Error de conexión. Revisa tu internet.'
    case 'auth/operation-not-allowed':
      return 'Este método de acceso no está habilitado en Firebase.'
    case 'auth/popup-closed-by-user':
      return 'Cerraste la ventana de Google antes de terminar.'
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana. Permite las ventanas emergentes.'
    case 'auth/cancelled-popup-request':
      return 'La solicitud de acceso fue cancelada.'
    case 'auth/account-exists-with-different-credential':
      return 'Este correo ya está registrado con otro método de acceso.'
    default:
      return 'No se pudo completar la operación. Inténtalo de nuevo.'
  }
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="w-5 h-5 shrink-0"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
        transform="translate(0 4)"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.24 5.62c4.23-3.91 7.54-9.69 7.54-17.27Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
        transform="translate(0 4)"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.79l-7.24-5.62c-2.01 1.35-4.59 2.15-8.67 2.15-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  )
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3 14.5 9.5 21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
          <path d="m19 2 .9 2.1L22 5l-2.1.9L19 8l-.9-2.1L16 5l2.1-.9L19 2Z" />
        </svg>
      </div>
      <span className="text-2xl font-extrabold tracking-tight text-slate-900">
        EduGen<span className="text-violet-600">AI</span>
      </span>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()

  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const set = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }))
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          router.replace('/dashboard')
        } else {
          setCheckingAuth(false)
        }
      },
      (error) => {
        console.error('Error de autenticación:', error)
        setCheckingAuth(false)
        toast.error('No se pudo comprobar tu sesión.')
      }
    )

    return unsubscribe
  }, [router])

  async function handleGoogleLogin() {
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account',
      })

      await signInWithPopup(auth, provider)

      toast.success('¡Bienvenido a EduGenAI!')
      await router.replace('/dashboard')
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error)

      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(getAuthError(error))
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const email = form.email.trim()
    const password = form.password

    if (!email || !password) {
      toast.error('Completa el correo y la contraseña.')
      return
    }

    if (tab === 'register') {
      if (!form.name.trim()) {
        toast.error('Ingresa tu nombre.')
        return
      }

      if (password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres.')
        return
      }
    }

    setLoading(true)

    try {
      if (tab === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success('¡Bienvenido a EduGenAI!')
      } else {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )

        await updateProfile(credential.user, {
          displayName: form.name.trim(),
        })

        toast.success('¡Cuenta creada correctamente!')
      }

      await router.replace('/dashboard')
    } catch (error) {
  console.error('Error de acceso:', error.code, error.message)

  if (error.code === 'auth/email-already-in-use') {
    toast.error('Este correo ya tiene una cuenta.')
  } else {
    toast.error(getAuthError(error))
  }
} finally {
  setLoading(false)
}
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="text-sm text-slate-500">
            Preparando tu espacio de trabajo...
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7fc] px-4 py-8 sm:px-6">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-200/50 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-indigo-950/10 lg:min-h-[650px] lg:grid-cols-2">
        {/* Panel de presentación */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-800 p-10 text-white lg:flex xl:p-12">
          <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -right-8 top-36 h-40 w-40 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-white/5" />

          <div className="relative">
            <div className="mb-16 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3 14.5 9.5 21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                EduGenAI
              </span>
            </div>

            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-violet-100">
              TU ASISTENTE DOCENTE CON IA
            </span>

            <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight xl:text-5xl">
              Menos tiempo preparando.
              <span className="mt-2 block text-violet-200">
                Más tiempo enseñando.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-indigo-100">
              Crea cuestionarios, ejercicios, ensayos y actividades
              educativas en minutos, adaptadas a tus materias y alumnos.
            </p>
          </div>

          <div className="relative mt-12 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  <path d="m9 8 2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Tu espacio de trabajo</p>
                <p className="mt-1 text-sm text-indigo-100">
                  Organiza y prepara tus actividades.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Panel de acceso */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <BrandMark />
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-violet-600">
                BIENVENIDO A EDUGENAI
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {tab === 'login' ? 'Qué gusto verte' : 'Crea tu cuenta'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {tab === 'login'
                  ? 'Inicia sesión para continuar con tus actividades.'
                  : 'Regístrate para comenzar a crear actividades con IA.'}
              </p>
            </div>

            {/* Selector de modo */}
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  tab === 'login'
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  tab === 'register'
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Acceso con Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleIcon />
              {loading ? 'Conectando...' : 'Continuar con Google'}
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">
                O continúa con tu correo
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={set('name')}
                    autoComplete="name"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:opacity-60"
                    required
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete={
                    tab === 'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:opacity-60"
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200/70 transition hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Procesando...
                  </>
                ) : tab === 'login' ? (
                  'Iniciar sesión'
                ) : (
                  'Crear cuenta gratis'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {tab === 'login'
                ? '¿Aún no tienes una cuenta?'
                : '¿Ya tienes una cuenta?'}{' '}
              <button
                type="button"
                onClick={() =>
                  setTab(tab === 'login' ? 'register' : 'login')
                }
                className="font-semibold text-violet-700 hover:text-violet-900 hover:underline"
              >
                {tab === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Al continuar, podrás acceder a tus actividades y herramientas
              de EduGenAI.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
