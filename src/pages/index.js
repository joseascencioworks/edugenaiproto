// src/pages/index.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getSession } from '@/lib/db'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.replace(getSession() ? '/dashboard' : '/login')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
