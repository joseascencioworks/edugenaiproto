// src/lib/useAuth.js

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { getSession, setSession, clearSession } from './session'
import toast from 'react-hot-toast'

export function useAuth({ requireAuth = true, redirectTo = '/login' } = {}) {
  const router = useRouter()
  // Inicializar en null/true en SSR para garantizar coincidencia de hidratación exacta
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    let active = true

    // Inmediatamente después del montaje en el cliente, sincronizar sesión local
    const cached = getSession()
    if (cached) {
      setUser(cached)
      setCheckingAuth(false)
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (!active) return

        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Docente',
            email: firebaseUser.email || '',
            status: 'Activo',
          }
          setUser(userData)
          setSession(userData)
          setCheckingAuth(false)
        } else {
          clearSession()
          setUser(null)
          setCheckingAuth(false)

          if (requireAuth) {
            router.replace(redirectTo)
          }
        }
      },
      (error) => {
        console.error('Error en autenticación:', error)
        if (!active) return
        setCheckingAuth(false)
        if (requireAuth) {
          toast.error('Sesión no disponible')
          router.replace(redirectTo)
        }
      }
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [requireAuth, redirectTo, router])

  async function logout() {
    try {
      clearSession()
      setUser(null)
      await signOut(auth)
      toast.success('Sesión cerrada correctamente')
      await router.replace('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('No se pudo cerrar la sesión')
    }
  }

  return { user, checkingAuth, logout, setUser }
}
