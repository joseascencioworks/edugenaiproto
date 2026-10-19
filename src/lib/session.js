// src/lib/session.js

const SESSION_KEY = 'edugenai_session'

export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.warn('Error reading session from localStorage:', e)
    return null
  }
}

export function setSession(user) {
  if (typeof window === 'undefined' || !user) return
  try {
    const sessionData = {
      uid: user.uid,
      name: user.displayName || user.name || 'Docente',
      email: user.email || '',
      status: 'Activo',
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
  } catch (e) {
    console.warn('Error saving session to localStorage:', e)
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (e) {
    console.warn('Error clearing session from localStorage:', e)
  }
}