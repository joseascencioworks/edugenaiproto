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
    return res.status(405).json({
      message: 'Método no permitido',
    })
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

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        message: 'El tema es obligatorio',
      })
    }

    const prompt = `
Eres un experto pedagogo especializado en educación en México.

Genera una actividad educativa COMPLETA, clara y lista para ser utilizada por un docente.

DATOS DE LA ACTIVIDAD:

Materia: ${subject}
Tema: ${topic}
Nivel educativo: ${level}
Tipo de actividad: ${type}
Dificultad: ${diff}

${extra ? `Indicaciones adicionales del docente: ${extra}` : ''}

${INSTRS[type]?.(qty) || ''}

REQUISITOS:

- La actividad debe estar relacionada directamente con el tema indicado.
- Adapta el contenido al nivel educativo.
- Utiliza lenguaje claro y académico.
- No inventes información que no sea necesaria.
- La actividad debe poder utilizarse directamente por un docente.
- Incluye criterios claros de evaluación.
- No agregues explicaciones sobre cómo generaste la actividad.

FORMATO OBLIGATORIO EN MARKDOWN:

# Título

## Objetivos

Escribe los objetivos de aprendizaje.

## Instrucciones

Explica claramente qué debe hacer el estudiante.

## Actividad

Desarrolla completamente la actividad.

## Evaluación

Incluye criterios o una rúbrica sencilla para evaluar el trabajo.
`

    const completion = await groq.chat.completions.create({

      // Modelo actual de Groq
      model: "openai/gpt-oss-120b",

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

    if (!content) {
      throw new Error('Groq no devolvió contenido')
    }

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
      message: error.message || 'Error generando actividad',
    })
  }
}