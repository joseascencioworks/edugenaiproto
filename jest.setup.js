import '@testing-library/jest-dom'

if (!global.Response) {
  global.Response = class Response {}
}
if (!global.Headers) {
  global.Headers = class Headers {}
}
if (!global.Request) {
  global.Request = class Request {}
}
if (!global.fetch) {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  )
}

process.env.NEXT_PUBLIC_FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyFakeKeyForTesting123456789'
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock.firebaseapp.com'
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project'
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock.appspot.com'
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789'
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:mock'

// Mock de next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(null),
    }
  },
}))

// Mock de Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb(null)
    return jest.fn()
  }),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn().mockResolvedValue(undefined),
  updateProfile: jest.fn().mockResolvedValue(undefined),
  GoogleAuthProvider: jest.fn(),
}))

// Mock de Firebase Firestore
const mockDbStore = new Map()

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn((col, ...clauses) => ({ col, clauses })),
  where: jest.fn((field, op, val) => ({ field, op, val })),
  addDoc: jest.fn(async (col, data) => {
    const id = data.id || `doc_${Date.now()}`
    const item = { ...data, id }
    const list = mockDbStore.get(data.userId) || []
    list.push(item)
    mockDbStore.set(data.userId, list)
    return { id }
  }),
  getDocs: jest.fn(async (q) => {
    const userIdClause = q?.clauses?.find?.((c) => c?.field === 'userId')
    const userId = userIdClause ? userIdClause.val : null
    let items = []
    if (userId && mockDbStore.has(userId)) {
      items = mockDbStore.get(userId)
    } else {
      mockDbStore.forEach((list) => items.push(...list))
    }
    return {
      docs: items.map((item) => ({
        id: item.id,
        data: () => item,
      })),
    }
  }),
  deleteDoc: jest.fn(async () => {}),
}))