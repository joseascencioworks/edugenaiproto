import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/useAuth'
import { saveActivity } from '@/lib/db'
import Layout from '@/components/Layout'
import MindMapVisual from '@/components/MindMapVisual'
import md2html from '@/lib/markdown'
import { exportPdf, exportDoc } from '@/lib/export'
import toast from 'react-hot-toast'
import { Sparkles, FileText, Download, CheckCircle2 } from 'lucide-react'

const SUBJECTS = [
  'Accesibilidad de Contenidos',
  'Inglés',
  'Desarrollo de Interfaces',
  'Control de Calidad de Software',
  'Matemáticas',
  'Sistemas Operativos',
  'Programación',
]

const LEVELS = [
  'Media Superior (Preparatoria)',
  'Superior (Universidad)',
]

const TYPES = [
  { value: 'Cuestionario' },
  { value: 'Mapa Mental' },
  { value: 'Ensayo' },
  { value: 'Caso' },
  { value: 'Ejercicios' },
]

const COLORS = {
  Cuestionario: { bg: '#eceafc', fg: '#2b3085' },
  'Mapa Mental': { bg: '#e6fffa', fg: '#0f766e' },
  Ensayo: { bg: '#f1f5f9', fg: '#334155' },
  Caso: { bg: '#eff6ff', fg: '#1e40af' },
  Ejercicios: { bg: '#fef2f2', fg: '#991b1b' },
}

export default function Generator() {
  const router = useRouter()
  const { user, checkingAuth } = useAuth({ requireAuth: true, redirectTo: '/login' })
  const [generating, setGen] = useState(false)
  const [result, setResult] = useState(null)

  const [subject, setSubject] = useState('Matemáticas')
  const [custom, setCustom] = useState('')
  const [topic, setTopic] = useState('')
  const [level, setLevel] = useState('Superior (Universidad)')
  const [type, setType] = useState('Cuestionario')
  const [qty, setQty] = useState('10')
  const [diff, setDiff] = useState('Intermedio')
  const [extra, setExtra] = useState('')

  // Generar una actividad con IA y guardarla en Firestore
  async function generate() {
    if (!user) {
      toast.error('Inicia sesión para generar una actividad.')
      return
    }

    if (!topic.trim()) {
      toast.error('Ingresa el tema')
      return
    }

    setGen(true)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject === 'Otra' ? custom.trim() : subject,
          topic: topic.trim(),
          level,
          type,
          qty,
          diff,
          extra,
          userId: user.uid,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al generar')
      }

      await saveActivity(user.uid, data)

      setResult(data)
      toast.success('¡Actividad generada con IA!')
    } catch (error) {
      console.error('Error al generar actividad:', error)
      toast.error(error.message || 'Error al generar')
    } finally {
      setGen(false)
    }
  }

  const tc = result
    ? COLORS[result.type] || { bg: '#f1f3f7', fg: '#334155' }
    : null

  // Esperar a que Firebase termine de comprobar la sesión
  if (checkingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef1f6]">
        <div className="text-center">
          <div className="w-9 h-9 border-3 border-[#1c335d] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#1e2554] tracking-wide">
            Cargando generador SICEUC...
          </p>
        </div>
      </div>
    )
  }

  return (
    <Layout user={user} active="generator">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Formulario */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] lg:sticky lg:top-[76px]">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-[#eceafc] flex items-center justify-center text-[#2b3085]">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#232368]">
                Parámetros de la Actividad
              </h2>
              <p className="text-[11px] text-slate-400">
                Configura los detalles pedagógicos
              </p>
            </div>
          </div>

          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#232368] mb-2">
            Materia
          </label>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  subject === s
                    ? 'bg-[#1c335d] border-[#1c335d] text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-[#1c335d]/40 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {subject === 'Otra' && (
            <input
              className="input mb-4"
              placeholder="Especifica la materia"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
          )}

          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#232368] mb-2">
            Tema *
          </label>

          <input
            className="input mb-4"
            placeholder="Ej. Ecuaciones de segundo grado"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault()
                generate()
              }
            }}
          />

          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#232368] mb-2">
            Nivel Educativo
          </label>

          <select
            className="input mb-4"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#232368] mb-2">
            Tipo de Actividad
          </label>

          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {TYPES.map(({ value }) => {
              const isSelected = type === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-[#1c335d] bg-[#eceafc] text-[#2b3085] shadow-sm'
                      : 'border-slate-200 bg-white hover:border-[#1c335d]/40 text-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-bold leading-tight">
                    {value}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#232368] mb-2">
                Cantidad
              </label>

              <select
                className="input"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              >
                {['5', '10', '15', '20'].map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#232368] mb-2">
                Dificultad
              </label>

              <select
                className="input"
                value={diff}
                onChange={(e) => setDiff(e.target.value)}
              >
                {['Básico', 'Intermedio', 'Avanzado'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#232368] mb-2">
            Instrucciones adicionales (opcional)
          </label>

          <textarea
            className="input min-h-[76px] resize-y mb-5"
            placeholder="Ej. Enfatizar aplicación práctica..."
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />

          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="w-full py-3.5 bg-gradient-to-r from-[#103847] via-[#163252] to-[#1c335d] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:opacity-95 transition-all disabled:opacity-60"
          >
            <Sparkles size={16} />
            <span>{generating ? 'Generando con IA...' : 'Generar con IA'}</span>
          </button>
        </div>

        {/* Resultado */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 min-h-[520px] flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {!result && !generating && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#f1f3f7] flex items-center justify-center text-[#232368]">
                <FileText size={28} />
              </div>
              <p className="font-bold text-[#232368] text-base">
                Listo para generar actividad
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Configura los parámetros a la izquierda y presiona &quot;Generar con IA&quot; para obtener la actividad.
              </p>
            </div>
          )}

          {generating && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#103847] to-[#1c335d] flex items-center justify-center text-white shadow-md animate-pulse">
                <Sparkles size={26} />
              </div>

              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-[#1c335d] animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>

              <p className="font-bold text-[#232368] text-sm">
                Generando actividad pedagógica con IA...
              </p>
              <p className="text-xs text-slate-400">
                El modelo está estructurando los contenidos según los parámetros seleccionados.
              </p>
            </div>
          )}

          {result && !generating && (
            <>
              {/* Result Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#232368] mb-2 leading-tight">
                    {result.title}
                  </h2>

                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: tc.bg, color: tc.fg }}
                    >
                      ✦ {result.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f1f3f7] text-[#232368]">
                      {result.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f1f3f7] text-[#232368]">
                      {result.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f1f3f7] text-[#232368]">
                      {result.diff}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      exportDoc(result)
                      toast.success('Documento DOC descargado')
                    }}
                    className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>DOC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      exportPdf(result).then(() =>
                        toast.success('Documento PDF descargado')
                      )
                    }
                    className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Rendered Content: Visual Mind Map or Structured Markdown */}
              <div className="flex-1 overflow-y-auto pr-2">
                {result.type === 'Mapa Mental' ? (
                  <MindMapVisual activity={result} />
                ) : (
                  <div
                    className="text-sm leading-relaxed text-slate-700 space-y-3"
                    dangerouslySetInnerHTML={{
                      __html: md2html(result.content),
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
