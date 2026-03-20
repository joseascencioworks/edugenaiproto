// src/lib/db.js
//
// ╔══════════════════════════════════════════════════════════╗
// ║  CAPA DE DATOS — adapter pattern                        ║
// ║                                                          ║
// ║  AHORA  → localStorage (sin config, corre inmediato)    ║
// ║  DESPUÉS → cambia las 4 funciones de abajo por          ║
// ║            las equivalentes de Firestore y listo.       ║
// ╚══════════════════════════════════════════════════════════╝

const KEY = (userId) => `edugenai_acts_${userId}`

// ── Lee todas las actividades del usuario ──────────────────
export function getActivities(userId) {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY(userId)) || '[]')
  } catch {
    return []
  }
}

// ── Guarda una actividad nueva ─────────────────────────────
export function saveActivity(userId, activity) {
  const list = getActivities(userId)
  list.unshift(activity)
  localStorage.setItem(KEY(userId), JSON.stringify(list))
  return activity
}

// ── Elimina por id ─────────────────────────────────────────
export function deleteActivity(userId, id) {
  const list = getActivities(userId).filter((a) => a.id !== id)
  localStorage.setItem(KEY(userId), JSON.stringify(list))
}

// ── Sesión de usuario (también en localStorage por ahora) ──
export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem('edugenai_session') || 'null')
  } catch {
    return null
  }
}

export function setSession(user) {
  localStorage.setItem('edugenai_session', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('edugenai_session')
}

// ══════════════════════════════════════════════════════════
//  PARA CONECTAR FIREBASE DESPUÉS:
//
//  1. npm install firebase
//  2. Crea src/lib/firebase.js con tu config
//  3. Reemplaza las funciones de arriba por esto:
//
//  import { db, auth } from './firebase'
//  import { collection, addDoc, getDocs,
//           deleteDoc, doc, query, where,
//           orderBy } from 'firebase/firestore'
//
//  export async function getActivities(userId) {
//    const q = query(
//      collection(db, 'activities'),
//      where('userId','==', userId),
//      orderBy('createdAt','desc')
//    )
//    const snap = await getDocs(q)
//    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
//  }
//
//  export async function saveActivity(userId, activity) {
//    const ref = await addDoc(collection(db,'activities'), activity)
//    return { id: ref.id, ...activity }
//  }
//
//  export async function deleteActivity(userId, id) {
//    await deleteDoc(doc(db, 'activities', id))
//  }
//
//  export function getSession()      { return auth.currentUser }
//  export function setSession(user)  { /* Firebase maneja esto */ }
//  export function clearSession()    { auth.signOut() }
// ══════════════════════════════════════════════════════════
