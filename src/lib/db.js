// src/lib/db.js

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore'

import { db } from './firebase'

// ==============================
// ACTIVIDADES
// ==============================

export async function saveActivity(userId, activity) {
  await addDoc(
    collection(db, 'activities'),
    {
      ...activity,
      userId
    }
  )
}

export async function getActivities(userId) {
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', userId)
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map(d => ({
    firestoreId: d.id,
    ...d.data()
  }))
}

export async function deleteActivity(firestoreId) {
  await deleteDoc(
    doc(db, 'activities', firestoreId)
  )
}

// ==============================
// SESSION
// ==============================

export function setSession(session) {
  localStorage.setItem(
    'edugenai_session',
    JSON.stringify(session)
  )
}

export function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem('edugenai_session')
    )
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem('edugenai_session')
}