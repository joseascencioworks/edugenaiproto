// src/components/ActivityCard.jsx
import React from 'react'
import { useState } from 'react'
import { FileText, Trash2, Eye } from 'lucide-react'
import { exportPdf, exportDoc } from '@/lib/export'
import md2html from '@/lib/markdown'
import toast from 'react-hot-toast'

const COLORS = {
  'Cuestionario': { bg: '#eff6ff', fg: '#2563eb' },
  'Mapa Mental':  { bg: '#f0fdf4', fg: '#059669' },
  'Ensayo':       { bg: '#fdf4ff', fg: '#7c3aed' },
  'Caso':         { bg: '#fff7ed', fg: '#d97706' },
  'Ejercicios':   { bg: '#fff1f2', fg: '#dc2626' },
}
const EMOJI = { 'Cuestionario':'', 'Mapa Mental':'', 'Ensayo':'', 'Caso':'', 'Ejercicios':'' }

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ActivityCard({ activity: act, onDelete }) {
  const [open, setOpen] = useState(false)
  const tc = COLORS[act.type] || { bg: '#f3f4f6', fg: '#374151' }

  return (
    <>
      <div className="card overflow-hidden hover:-translate-y-0.5 hover:shadow-md hover:border-blue-100 transition-all">
        {/* Top stripe */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold"
            style={{ background: tc.bg, color: tc.fg }}>
            {EMOJI[act.type] ?? ''} {act.type}
          </span>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2 mb-2">{act.title}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-gray-400">
            <span> {act.subject}</span>
            <span> {act.level}</span>
            <span> {fmtDate(act.createdAt)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[12px] text-gray-400">{act.diff}</span>
          <div className="flex gap-1.5">
            <button onClick={() => setOpen(true)} title="Ver"
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
              <Eye size={13} />
            </button>
            <button onClick={() => { exportDoc(act); toast.success('DOC descargado ✓') }} title="DOC"
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
              <FileText size={13} />
            </button>
            <button onClick={() => exportPdf(act).then(() => toast.success('PDF descargado ✓'))} title="PDF"
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors">
              <span className="text-[11px] font-bold">PDF</span>
            </button>
            <button onClick={() => onDelete(act.firestoreId)} title="Eliminar"
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(13,17,23,.55)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-bold text-gray-900 pr-4 line-clamp-1">{act.title}</h2>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-lg leading-none">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 text-[14px] leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: md2html(act.content) }} />
            <div className="px-6 py-3 border-t border-gray-100 flex gap-2 justify-end flex-shrink-0">
              <button onClick={() => { exportDoc(act); toast.success('DOC descargado ✓') }}
                className="btn-ghost text-xs">📄 Exportar DOC</button>
              <button onClick={() => exportPdf(act).then(() => toast.success('PDF descargado ✓'))}
                className="btn-ghost text-xs">📑 Exportar PDF</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
