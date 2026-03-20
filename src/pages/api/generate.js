// src/pages/api/generate.js
// Solo necesita ANTHROPIC_API_KEY en .env.local

import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const INSTRS = {
  'Cuestionario': (q) => `Crea ${q} preguntas de opción múltiple (a,b,c,d). Marca la correcta con ✓. Incluye "Clave de respuestas" al final.`,
  'Mapa Mental':  ()  => `Estructura un mapa mental: nodo central, 5-7 ramas principales, 3-4 sub-nodos por rama. Formato textual jerarquizado con sangría.`,
  'Ensayo':       (q) => `Guía de ensayo: tesis sugerida, ${q} puntos de desarrollo con argumentos, conclusión y rúbrica de evaluación.`,
  'Caso':         (q) => `Estudio de caso realista: contexto narrativo, datos relevantes, problema central, ${q} preguntas de análisis y rúbrica.`,
  'Ejercicios':   (q) => `${q} ejercicios prácticos progresivos con enunciado, datos y solución detallada al final.`,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { subject, topic, level, type, qty, diff, extra, userId } = req.body

  if (!topic)  return res.status(400).json({ message: 'El tema es requerido' })
  if (!type)   return res.status(400).json({ message: 'El tipo es requerido' })

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ message: '❌ Falta ANTHROPIC_API_KEY en .env.local' })
  }

  const prompt = `Eres un experto pedagogo para educación en México.

Crea una actividad educativa COMPLETA con estas características:
- Materia: ${subject}
- Tema: ${topic}
- Nivel: ${level}
- Tipo: ${type}
- Dificultad: ${diff}
${extra ? `- Instrucciones del docente: ${extra}` : ''}

Instrucciones específicas para ${type}:
${INSTRS[type]?.(qty) ?? `Crea ${qty} elementos de tipo ${type}.`}

FORMATO OBLIGATORIO (usa Markdown):
# [Título creativo y específico]

## 🎯 Objetivos de Aprendizaje
[2-3 objetivos claros en verbos de acción]

## 📋 Instrucciones para el Estudiante
[Instrucciones claras y motivadoras]

## 📝 Actividad
[Contenido principal]

## ✅ Evaluación
[Criterios de evaluación o rúbrica]`

  try {
    const msg     = await claude.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 2800,
      messages:   [{ role: 'user', content: prompt }],
    })
    const content = msg.content[0].text
    const title   = content.match(/^#\s+(.+)/m)?.[1]?.replace(/\*/g, '').trim()
                 ?? `${type} – ${topic}`

    const activity = {
      id:         `act_${Date.now()}`,
      title,
      content,
      subject,
      topic,
      level,
      type,
      diff,
      userId,
      createdAt:  new Date().toISOString(),
    }

    return res.status(201).json(activity)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: e.message || 'Error al generar con IA' })
  }
}
