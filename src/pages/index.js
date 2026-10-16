// src/pages/index.js
import React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getSession } from '@/lib/db'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace(getSession() ? '/dashboard' : '/login')
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#eef1f6]">
      <div className="w-9 h-9 border-3 border-[#1c335d] border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-xs font-semibold text-[#1e2554] tracking-wide">
        Cargando portal SICEUC...
      </span>
    </div>
  )
}
