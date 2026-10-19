// src/lib/db.js

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore'

import { db } from './firebase'
import { getSession, setSession, clearSession } from './session'

// Re-export session helpers for backward compatibility
export { getSession, setSession, clearSession }

// Lightweight memory cache to speed up navigation across dashboard and activities
const activitiesCache = new Map()
const CACHE_TTL_MS = 60000 // 1 minute

// ==============================
// ACTIVIDADES
// ==============================

export async function saveActivity(userId, activity) {
  const docRef = await addDoc(collection(db, 'activities'), {
    ...activity,
    userId,
    createdAt: activity.createdAt || new Date().toISOString(),
  })

  // Invalidate cache for this user
  activitiesCache.delete(userId)

  return docRef.id
}

export async function getActivities(userId, { forceRefresh = false } = {}) {
  if (!userId) return []

  const cached = activitiesCache.get(userId)
  const now = Date.now()

  if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const q = query(collection(db, 'activities'), where('userId', '==', userId))
  const snapshot = await getDocs(q)

  const data = snapshot.docs
    .map((d) => ({
      firestoreId: d.id,
      ...d.data(),
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  activitiesCache.set(userId, { data, timestamp: now })
  return data
}

export async function deleteActivity(firestoreId, userId) {
  await deleteDoc(doc(db, 'activities', firestoreId))

  if (userId) {
    activitiesCache.delete(userId)
  } else {
    activitiesCache.clear()
  }
}

export function clearActivitiesCache(userId) {
  if (userId) {
    activitiesCache.delete(userId)
  } else {
    activitiesCache.clear()
  }
}