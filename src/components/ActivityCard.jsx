import React, { useState } from 'react'
import { FileText, Trash2, Eye, Calendar, BookOpen } from 'lucide-react'
import { exportPdf, exportDoc } from '@/lib/export'
import md2html from '@/lib/markdown'
import toast from 'react-hot-toast'

const COLORS = {
  'Cuestionario': { bg: '#eceafc', fg: '#2b3085' },
  'Mapa Mental':  { bg: '#e6fffa', fg: '#0f766e' },
  'Ensayo':       { bg: '#f1f5f9', fg: '#334155' },
  'Caso':         { bg: '#eff6ff', fg: '#1e40af' },
  'Ejercicios':   { bg: '#fef2f2', fg: '#991b1b' },
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ActivityCard({ activity: act, onDelete }) {
  const [open, setOpen] = useState(false)
  const tc = COLORS[act.type] || { bg: '#f1f3f7', fg: '#334155' }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#1c335d]/30 transition-all overflow-hidden flex flex-col justify-between">
        {/* Top badge stripe */}
        <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-100 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
            style={{ background: tc.bg, color: tc.fg }}
          >
            <span>✦</span>
            <span>{act.type}</span>
          </span>

          <span className="text-[11px] font-semibold text-slate-400">
            {act.diff}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1">
          <h3 className="text-sm font-bold text-[#232368] leading-snug line-clamp-2 mb-2">
            {act.title}
          </h3>

          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <BookOpen size={12} className="text-slate-400 shrink-0" />
              <span className="truncate">{act.subject} · {act.level}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Calendar size={12} className="shrink-0" />
              <span>{fmtDate(act.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Card Footer with SICEUC-style icon buttons */}
        <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-slate-100 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            title="Ver"
            aria-label="Ver"
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-[#eceafc] hover:text-[#2b3085] hover:border-[#2b3085]/30 transition-colors"
          >
            <Eye size={13} />
          </button>

          <button
            type="button"
            onClick={() => {
              exportDoc(act)
              toast.success('Documento DOC descargado')
            }}
            title="DOC"
            aria-label="DOC"
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-[#eceafc] hover:text-[#2b3085] hover:border-[#2b3085]/30 transition-colors"
          >
            <FileText size={13} />
          </button>

          <button
            type="button"
            onClick={() =>
              exportPdf(act).then(() => toast.success('Documento PDF descargado'))
            }
            title="PDF"
            aria-label="PDF"
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-[#eceafc] hover:text-[#2b3085] hover:border-[#2b3085]/30 transition-colors"
          >
            <span className="text-[10px] font-bold">PDF</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(act.firestoreId || act.id)}
            title="Eliminar"
            aria-label="Eliminar"
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* SICEUC Detail Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(16, 32, 56, 0.65)', backdropFilter: 'blur(3px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2 pr-4">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
                  style={{ background: tc.bg, color: tc.fg }}
                >
                  {act.type}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-[#232368] line-clamp-1">
                  {act.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors text-base"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div
              className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-slate-700 space-y-3"
              dangerouslySetInnerHTML={{ __html: md2html(act.content) }}
            />

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-[#f8fafc] flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                {act.subject} · {act.level} · {act.diff}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    exportDoc(act)
                    toast.success('Documento DOC descargado')
                  }}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  📄 Exportar DOC
                </button>
                <button
                  type="button"
                  onClick={() =>
                    exportPdf(act).then(() => toast.success('Documento PDF descargado'))
                  }
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  📑 Exportar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
