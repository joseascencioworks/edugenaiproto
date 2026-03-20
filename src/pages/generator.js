// src/pages/generator.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSession, saveActivity } from '@/lib/db'
import Layout from '@/components/Layout'
import md2html from '@/lib/markdown'
import { exportPdf, exportDoc } from '@/lib/export'
import toast from 'react-hot-toast'

const SUBJECTS = ['Matemáticas','Español','Ciencias','Historia','Geografía','Inglés','Física','Química','Biología','Arte','Otra']
const LEVELS   = ['Preescolar','Primaria (1°–3°)','Primaria (4°–6°)','Secundaria','Preparatoria','Universidad','Posgrado']
const TYPES    = [
  { value:'Cuestionario', emoji:'📝' },
  { value:'Mapa Mental',  emoji:'🗺️' },
  { value:'Ensayo',       emoji:'✍️' },
  { value:'Caso',         emoji:'🔍' },
  { value:'Ejercicios',   emoji:'🧮' },
]
const COLORS = {
  'Cuestionario':{ bg:'#eff6ff', fg:'#2563eb' },
  'Mapa Mental': { bg:'#f0fdf4', fg:'#059669' },
  'Ensayo':      { bg:'#fdf4ff', fg:'#7c3aed' },
  'Caso':        { bg:'#fff7ed', fg:'#d97706' },
  'Ejercicios':  { bg:'#fff1f2', fg:'#dc2626' },
}

export default function Generator() {
  const router = useRouter()
  const [user, setUser]     = useState(null)
  const [generating, setGen]= useState(false)
  const [result, setResult] = useState(null)

  const [subject, setSubject] = useState('Matemáticas')
  const [custom,  setCustom]  = useState('')
  const [topic,   setTopic]   = useState('')
  const [level,   setLevel]   = useState('Secundaria')
  const [type,    setType]    = useState('Cuestionario')
  const [qty,     setQty]     = useState('10')
  const [diff,    setDiff]    = useState('Intermedio')
  const [extra,   setExtra]   = useState('')

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/login'); return }
    setUser(session)
  }, [router])

  async function generate() {
    if (!topic.trim()) { toast.error('Ingresa el tema'); return }
    setGen(true); setResult(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject === 'Otra' ? (custom || 'Materia') : subject,
          topic, level, type, qty, diff, extra,
          userId: user.uid,
        }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      const data = await res.json()

      // Save to localStorage via db adapter
      saveActivity(user.uid, data)
      setResult(data)
      toast.success('¡Actividad generada! ✨')
    } catch (e) {
      toast.error(e.message || 'Error al generar')
    } finally {
      setGen(false)
    }
  }

  const tc = result ? (COLORS[result.type] || { bg:'#f3f4f6', fg:'#374151' }) : null

  return (
    <Layout user={user} active="generator">
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">

        {/* ── FORM ── */}
        <div className="card p-5 lg:sticky lg:top-[76px]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Materia</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-all
                  ${subject === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                {s}
              </button>
            ))}
          </div>

          {subject === 'Otra' && (
            <input className="input mb-4" placeholder="Especifica la materia" value={custom} onChange={e => setCustom(e.target.value)} />
          )}

          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tema *</p>
          <input className="input mb-4" placeholder="Ej. Ecuaciones de segundo grado"
            value={topic} onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.ctrlKey && e.key === 'Enter' && generate()} />

          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Nivel</p>
          <select className="input mb-4" value={level} onChange={e => setLevel(e.target.value)}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>

          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tipo</p>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {TYPES.map(({ value, emoji }) => (
              <button key={value} onClick={() => setType(value)}
                className={`flex flex-col items-center py-2.5 rounded-xl border-[1.5px] transition-all
                  ${type === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-200'}`}>
                <span className="text-lg mb-0.5">{emoji}</span>
                <span className={`text-[10px] font-bold ${type === value ? 'text-blue-600' : 'text-gray-500'}`}>{value}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Cantidad</p>
              <select className="input" value={qty} onChange={e => setQty(e.target.value)}>
                {['5','10','15','20'].map(q => <option key={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Dificultad</p>
              <select className="input" value={diff} onChange={e => setDiff(e.target.value)}>
                {['Básico','Intermedio','Avanzado'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Instrucciones extra</p>
          <textarea className="input min-h-[72px] resize-y mb-4" placeholder="Opcional…"
            value={extra} onChange={e => setExtra(e.target.value)} />

          <button onClick={generate} disabled={generating}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-sm
              flex items-center justify-center gap-2 shadow-md shadow-blue-500/20
              hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 transition-all">
            {generating
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generando…</>
              : '✨ Generar con IA'}
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-2">Ctrl + Enter para generar</p>
        </div>

        {/* ── RESULT ── */}
        <div className="card p-6 min-h-[480px] flex flex-col">
          {!result && !generating && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl">🤖</div>
              <p className="font-semibold text-gray-600">Listo para generar</p>
              <p className="text-sm max-w-xs">Completa el formulario y presiona "Generar con IA"</p>
            </div>
          )}
          {generating && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-2xl animate-pulse">✨</div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" style={{ animationDelay:`${i*200}ms` }}/>)}
              </div>
              <p className="font-semibold text-gray-700">Generando con IA…</p>
              <p className="text-sm text-gray-400">Esto puede tardar unos segundos</p>
            </div>
          )}
          {result && !generating && (
            <>
              <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{result.title}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label:result.type,    ...tc },
                      { label:result.subject, bg:'#eff6ff', fg:'#2563eb' },
                      { label:result.level,   bg:'#f0fdf4', fg:'#059669' },
                      { label:result.diff,    bg:'#fdf4ff', fg:'#7c3aed' },
                    ].map(({ label, bg, fg }) => (
                      <span key={label} className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background:bg, color:fg }}>{label}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { exportDoc(result); toast.success('DOC descargado ✓') }}
                    className="btn-ghost text-xs px-3 py-2">📄 DOC</button>
                  <button onClick={() => exportPdf(result).then(() => toast.success('PDF descargado ✓'))}
                    className="btn-ghost text-xs px-3 py-2">📑 PDF</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: md2html(result.content) }} />
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
