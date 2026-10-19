// src/components/MindMapVisual.jsx
import React, { useState, useMemo } from 'react'
import {
  Share2,
  Sparkles,
  Layers,
  FileText,
  ChevronRight,
  Circle,
  FolderTree,
} from 'lucide-react'
import md2html from '@/lib/markdown'

// Paletas de color modernas para las ramas del mapa mental
const BRANCH_PALETTES = [
  {
    border: 'border-teal-200',
    bg: 'bg-teal-50/60',
    headerBg: 'bg-teal-600',
    badge: 'bg-teal-100 text-teal-800',
    dot: 'bg-teal-500',
    accentText: 'text-teal-900',
    connector: 'border-teal-300',
  },
  {
    border: 'border-indigo-200',
    bg: 'bg-indigo-50/60',
    headerBg: 'bg-indigo-600',
    badge: 'bg-indigo-100 text-indigo-800',
    dot: 'bg-indigo-500',
    accentText: 'text-indigo-900',
    connector: 'border-indigo-300',
  },
  {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/60',
    headerBg: 'bg-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
    accentText: 'text-emerald-900',
    connector: 'border-emerald-300',
  },
  {
    border: 'border-amber-200',
    bg: 'bg-amber-50/60',
    headerBg: 'bg-amber-600',
    badge: 'bg-amber-100 text-amber-900',
    dot: 'bg-amber-500',
    accentText: 'text-amber-900',
    connector: 'border-amber-300',
  },
  {
    border: 'border-purple-200',
    bg: 'bg-purple-50/60',
    headerBg: 'bg-purple-600',
    badge: 'bg-purple-100 text-purple-800',
    dot: 'bg-purple-500',
    accentText: 'text-purple-900',
    connector: 'border-purple-300',
  },
  {
    border: 'border-sky-200',
    bg: 'bg-sky-50/60',
    headerBg: 'bg-sky-600',
    badge: 'bg-sky-100 text-sky-800',
    dot: 'bg-sky-500',
    accentText: 'text-sky-900',
    connector: 'border-sky-300',
  },
]

/**
 * Parsea el contenido markdown para extraer la jerarquía del mapa mental:
 * Nodo Central -> Ramas Principales -> Sub-ramas / Palabras Clave
 */
export function parseMindMap(content, defaultTitle = 'Tema Principal') {
  if (!content) return { centralNode: defaultTitle, branches: [] }

  // Extraer Título o Nodo Central
  let centralNode = defaultTitle
  const titleMatch = content.match(/^#\s+(.+)$/m)
  if (titleMatch) {
    centralNode = titleMatch[1].replace(/mapa\s+mental\s*[-–:]\s*/i, '').trim()
  }

  // Buscar sección de la actividad si existe
  let section = content
  const actMatch = content.match(/##\s+(?:Actividad|Contenido|Desarrollo|Mapa\s+Mental)([\s\S]*?)(?:##\s+Evaluación|$)/i)
  if (actMatch) {
    section = actMatch[1]
  }

  const branches = []
  const lines = section.split('\n')
  let currentBranch = null

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()
    if (!trimmed) continue

    // Detectar encabezado H3: ### 1. Rama
    const h3Match = rawLine.match(/^###\s+(.+)$/)
    // Detectar viñeta de primer nivel con negrita: - **Rama**: Descripción
    const topBulletMatch = rawLine.match(/^[-*]\s+\*\*([^*]+)\*\*(?::\s*(.*))?$/)
    const topNumMatch = rawLine.match(/^\d+[\.\)]\s+\*\*([^*]+)\*\*(?::\s*(.*))?$/)
    // Detectar viñeta sin negrita pero en nivel superior: - Rama X
    const simpleTopBullet = !rawLine.startsWith(' ') && !rawLine.startsWith('\t') && rawLine.match(/^[-*]\s+([A-ZÁÉÍÓÚ][^:]+)(?::\s*(.*))?$/)

    if (h3Match) {
      currentBranch = {
        title: h3Match[1].replace(/^\d+[\.\)]\s*/, '').trim(),
        description: '',
        items: [],
      }
      branches.push(currentBranch)
    } else if (topBulletMatch || topNumMatch) {
      const match = topBulletMatch || topNumMatch
      currentBranch = {
        title: match[1].trim(),
        description: match[2] ? match[2].trim() : '',
        items: [],
      }
      branches.push(currentBranch)
    } else if (simpleTopBullet && !trimmed.startsWith('- [ ]')) {
      currentBranch = {
        title: simpleTopBullet[1].trim(),
        description: simpleTopBullet[2] ? simpleTopBullet[2].trim() : '',
        items: [],
      }
      branches.push(currentBranch)
    } else if (currentBranch) {
      // Sub-rama o elemento hijo (con sangría o guion dentro de una rama activa)
      if (rawLine.startsWith(' ') || rawLine.startsWith('\t') || (trimmed.startsWith('- ') && !trimmed.includes('**'))) {
        const itemText = trimmed.replace(/^[-*•\d\.]+\s*/, '').trim()
        if (itemText && !itemText.startsWith('#')) {
          currentBranch.items.push(itemText)
        }
      }
    }
  }

  // Fallback si el texto no tenía viñetas estructuradas:
  if (branches.length === 0) {
    const fallbackMatches = content.match(/[-*]\s+([^\n]+)/g) || []
    fallbackMatches.slice(0, 6).forEach((bm, idx) => {
      const cleaned = bm.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').trim()
      const parts = cleaned.split(/[:–-]\s+/)
      branches.push({
        title: parts[0] || `Rama ${idx + 1}`,
        description: parts[1] || '',
        items: [],
      })
    })
  }

  return {
    centralNode,
    branches: branches.slice(0, 8),
  }
}

export default function MindMapVisual({ activity }) {
  const [viewMode, setViewMode] = useState('visual') // 'visual' | 'text'

  const mindMapData = useMemo(() => {
    return parseMindMap(activity?.content, activity?.title || activity?.topic || 'Tema Central')
  }, [activity?.content, activity?.title, activity?.topic])

  const { centralNode, branches } = mindMapData

  return (
    <div className="w-full space-y-5">
      {/* Selector de Vista: Diagrama Visual vs Texto Guía */}
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2 px-2">
          <FolderTree size={16} className="text-[#1c335d]" />
          <span className="text-xs font-bold text-[#1e2554]">
            Mapa Mental Interactivo
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'visual'
                ? 'bg-[#1c335d] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1c335d]'
            }`}
          >
            <Share2 size={13} />
            <span>Diagrama Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('text')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'text'
                ? 'bg-[#1c335d] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1c335d]'
            }`}
          >
            <FileText size={13} />
            <span>Guía y Rúbrica</span>
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="bg-gradient-to-b from-slate-50/50 to-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 space-y-6">
          {/* 1. NODO CENTRAL (Concepto Principal) */}
          <div className="flex flex-col items-center text-center relative">
            <div className="relative group max-w-lg w-full">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 opacity-25 blur-sm" />
              <div className="relative bg-gradient-to-r from-[#133a4c] via-[#1b3558] to-[#252f5c] text-white px-6 py-4 rounded-2xl shadow-md border border-white/20">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/15 text-[#5eead4] mb-1.5">
                  <Sparkles size={11} />
                  <span>Nodo Central</span>
                </span>
                <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-wide leading-snug">
                  {centralNode}
                </h3>
                {activity?.subject && (
                  <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
                    {activity.subject} {activity.level ? `· ${activity.level}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Línea conectora central hacia abajo */}
            <div className="w-0.5 h-6 bg-slate-300 mt-2" />
            <div className="w-3 h-3 rounded-full bg-[#1c335d] -mt-1 ring-4 ring-slate-100" />
          </div>

          {/* 2. RAMAS PRINCIPALES Y SUB-RAMAS */}
          {branches.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">
              Visualización estructurada en proceso. Revisa la pestaña de Guía y Rúbrica.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {branches.map((branch, index) => {
                const palette = BRANCH_PALETTES[index % BRANCH_PALETTES.length]
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border ${palette.border} ${palette.bg} p-4.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:shadow-md flex flex-col justify-between`}
                  >
                    <div>
                      {/* Cabecera de la Rama */}
                      <div className="flex items-start gap-2.5 mb-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide shrink-0 ${palette.badge}`}
                        >
                          Rama {index + 1}
                        </span>
                        <h4
                          className={`text-sm font-extrabold leading-snug ${palette.accentText}`}
                        >
                          {branch.title}
                        </h4>
                      </div>

                      {branch.description && (
                        <p className="text-xs text-slate-600 mb-3 pl-1 leading-relaxed">
                          {branch.description}
                        </p>
                      )}

                      {/* Sub-ramas y Palabras Clave */}
                      {branch.items && branch.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5 pl-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Sub-ramas y conceptos:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {branch.items.map((item, itemIdx) => (
                              <div
                                key={itemIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${palette.dot} shrink-0`}
                                />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Vista de Guía, Instrucciones y Rúbrica completa en Markdown */
        <div
          className="bg-white rounded-3xl border border-slate-200/80 p-6 text-sm leading-relaxed text-slate-700 space-y-3"
          dangerouslySetInnerHTML={{
            __html: md2html(activity?.content),
          }}
        />
      )}
    </div>
  )
}

