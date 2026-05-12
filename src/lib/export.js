// src/lib/export.js

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

// ============================
// EXPORTAR PDF
// ============================

export async function exportPdf(activity) {

  const pdf = new jsPDF()

  pdf.setFontSize(18)
  pdf.text(activity.title || 'Actividad', 10, 20)

  pdf.setFontSize(12)

  const text = `
Materia: ${activity.subject}

Nivel: ${activity.level}

Tipo: ${activity.type}

Dificultad: ${activity.diff}

Contenido:

${activity.content.replace(/[#*|]/g, '')}
  `

  const lines = pdf.splitTextToSize(text, 180)

  pdf.text(lines, 10, 35)

  pdf.save(`${activity.title || 'actividad'}.pdf`)
}

// ============================
// EXPORTAR DOC
// ============================

export async function exportDoc(activity) {

  const content = `
${activity.title}

Materia: ${activity.subject}
Nivel: ${activity.level}
Tipo: ${activity.type}
Dificultad: ${activity.diff}

${activity.content}
  `

  const blob = new Blob(
    [content],
    { type: 'application/msword;charset=utf-8' }
  )

  saveAs(blob, `${activity.title || 'actividad'}.doc`)
}