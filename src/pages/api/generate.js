// src/pages/api/generate.js

import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const INSTRS = {
  'Cuestionario': (q) =>
    `Crea ${q} preguntas de opción múltiple (a,b,c,d). Marca la correcta con ✓ e incluye respuestas.`,

  'Mapa Mental': () =>
    `Crea un mapa mental textual con ramas y subramas.`,

  'Ensayo': (q) =>
    `Crea una guía de ensayo con ${q} puntos de desarrollo.`,

  'Caso': (q) =>
    `Crea un caso práctico con ${q} preguntas de análisis.`,

  'Ejercicios': (q) =>
    `Crea ${q} ejercicios con solución.`,
}

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {

    const {
      subject,
      topic,
      level,
      type,
      qty,
      diff,
      extra,
      userId
    } = req.body

    const prompt = `
Eres un experto pedagogo para educación en México.

Genera una actividad educativa COMPLETA.

Materia: ${subject}
Tema: ${topic}
Nivel: ${level}
Tipo: ${type}
Dificultad: ${diff}

${extra ? `Indicaciones extra: ${extra}` : ''}

${INSTRS[type]?.(qty)}

FORMATO EN MARKDOWN:

# Título

## 🎯 Objetivos
## 📋 Instrucciones
## 📝 Actividad
## ✅ Evaluación
`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.7,
      max_tokens: 2000,
    })

    const content =
      completion.choices[0]?.message?.content || ''

    const title =
      content.match(/^#\s+(.+)/m)?.[1]?.trim()
      || `Actividad - ${topic}`

    const activity = {
      id: `act_${Date.now()}`,
      title,
      content,
      subject,
      topic,
      level,
      type,
      diff,
      userId,
      createdAt: new Date().toISOString(),
    }

    return res.status(200).json(activity)

  } catch (error) {

    console.error("ERROR GROQ:", error)

    return res.status(500).json({
      message: error.message || 'Error generando actividad'
    })
  }
}