// src/lib/export.js
import { parseMindMap } from '@/components/MindMapVisual'

// Función saveAs nativa y segura para el navegador
export function saveAs(blob, filename) {
  if (typeof window === 'undefined') return

  if (window.URL && document.createElement) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

/**
 * Convierte el contenido markdown a HTML estructurado compatible con Microsoft Word
 * utilizando estilos de esquema (mso-outline-level) para que Word reconozca
 * automáticamente los niveles de encabezado (Título 1, Título 2, etc.), fuentes y redacción.
 */
function convertMarkdownToWordBody(md) {
  if (!md) return ''

  let html = md
    .replace(/&(?![a-z#\d]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Encabezados con niveles de esquema nativos de Microsoft Word
  html = html.replace(/^###\s+(.+)$/gm, '<h3 style="font-family:Calibri,Arial,sans-serif;font-size:12pt;font-weight:bold;color:#334155;margin-top:10pt;margin-bottom:4pt;mso-outline-level:3;page-break-after:avoid;">$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2 style="font-family:Calibri,Arial,sans-serif;font-size:14pt;font-weight:bold;color:#1c335d;margin-top:14pt;margin-bottom:6pt;border-bottom:1.5pt solid #e2e8f0;padding-bottom:3pt;mso-outline-level:2;page-break-after:avoid;">$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1 style="font-family:Calibri,Arial,sans-serif;font-size:18pt;font-weight:bold;color:#102a45;margin-top:16pt;margin-bottom:8pt;mso-outline-level:1;page-break-after:avoid;">$1</h1>')

  // Negrita, cursiva y código
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`(.+?)`/g, '<code style="font-family:Consolas,monospace;background:#f1f5f9;padding:1pt 4pt;font-size:10pt;border:1pt solid #e2e8f0;border-radius:3pt;">$1</code>')

  // Citas y separadores
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1pt solid #cbd5e1;margin:12pt 0;"/>')
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote style="border-left:3pt solid #2563eb;margin:8pt 0;padding:6pt 10pt;background:#f8fafc;color:#334155;font-style:italic;">$1</blockquote>')

  // Tablas
  html = html.replace(/(\|.+\|\n?)+/g, (tableText) => {
    const rows = tableText.trim().split('\n')
    let out = '<table style="width:100%;border-collapse:collapse;margin:10pt 0;font-size:10pt;font-family:Calibri,Arial,sans-serif;">'
    rows.forEach((r, i) => {
      if (/^\|[-| :]+\|$/.test(r.trim())) return
      const cells = r.split('|').filter((_, j, arr) => j > 0 && j < arr.length - 1)
      const tag = i === 0 ? 'th' : 'td'
      const style = i === 0
        ? 'background-color:#f1f5f9;color:#1c335d;font-weight:bold;border:1pt solid #cbd5e1;padding:6pt 8pt;text-align:left;'
        : 'border:1pt solid #e2e8f0;padding:5pt 8pt;vertical-align:top;'
      out += '<tr>' + cells.map(c => `<${tag} style="${style}">${c.trim()}</${tag}>`).join('') + '</tr>'
    })
    return out + '</table>'
  })

  // Listas ordenadas y desordenadas
  html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<li class="word-ol-li" style="margin-bottom:3pt;">$2</li>')
  html = html.replace(/(<li class="word-ol-li".+<\/li>\n?)+/g, (m) =>
    `<ol style="font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:4pt 0 8pt 20pt;line-height:1.4;">${m.replace(/ class="word-ol-li"/g, '')}</ol>`)

  html = html.replace(/^[-*•]\s+(.+)$/gm, '<li class="word-ul-li" style="margin-bottom:3pt;">$1</li>')
  html = html.replace(/(<li class="word-ul-li".+<\/li>\n?)+/g, (m) =>
    `<ul style="font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:4pt 0 8pt 20pt;list-style-type:disc;line-height:1.4;">${m.replace(/ class="word-ul-li"/g, '')}</ul>`)

  // Párrafos regulares
  html = html.split('\n\n').map((block) => {
    const b = block.trim()
    if (!b) return ''
    if (/^<(h[1-6]|ul|ol|table|blockquote|hr)/i.test(b)) return b
    return `<p style="font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.45;color:#1e293b;margin:0 0 6pt 0;text-align:justify;">${b.replace(/\n/g, '<br/>')}</p>`
  }).join('\n')

  return html
}

/**
 * Genera una representación visual estructurada para Mapas Mentales en Word
 */
function buildWordMindMapHtml(activity) {
  const { centralNode, branches } = parseMindMap(activity?.content, activity?.title || 'Tema Central')

  if (branches.length === 0) return ''

  let html = `
    <div style="margin:14pt 0 18pt 0;page-break-inside:avoid;">
      <h2 style="font-family:Calibri,Arial,sans-serif;font-size:13pt;font-weight:bold;color:#1c335d;border-bottom:1.5pt solid #1c335d;padding-bottom:3pt;mso-outline-level:2;margin-bottom:10pt;">
        ESTRUCTURA VISUAL DEL MAPA MENTAL
      </h2>
      
      <!-- Nodo Central -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:10pt;">
        <tr>
          <td style="background-color:#1c335d;color:#ffffff;text-align:center;padding:10pt;border-radius:6pt;font-family:Calibri,Arial,sans-serif;">
            <div style="font-size:9pt;font-weight:bold;text-transform:uppercase;letter-spacing:1pt;color:#5eead4;margin-bottom:2pt;">
              NODO CENTRAL · TEMA PRINCIPAL
            </div>
            <div style="font-size:16pt;font-weight:bold;color:#ffffff;">
              ${centralNode}
            </div>
          </td>
        </tr>
      </table>

      <!-- Ramas Principales y Sub-ramas en cuadrícula / tabla -->
      <table style="width:100%;border-collapse:collapse;margin-top:6pt;">
  `

  for (let i = 0; i < branches.length; i += 2) {
    const b1 = branches[i]
    const b2 = branches[i + 1]

    html += '<tr>'
    
    // Rama 1
    html += `
      <td style="width:50%;padding:6pt;vertical-align:top;border:none;">
        <div style="background-color:#f8fafc;border:1pt solid #cbd5e1;border-left:4pt solid #0d9488;border-radius:4pt;padding:8pt 10pt;">
          <div style="font-size:9pt;font-weight:bold;color:#0d9488;text-transform:uppercase;margin-bottom:2pt;">
            RAMA ${i + 1}
          </div>
          <div style="font-size:12pt;font-weight:bold;color:#1e293b;margin-bottom:4pt;">
            ${b1.title}
          </div>
          ${b1.description ? `<div style="font-size:10pt;color:#475569;margin-bottom:6pt;">${b1.description}</div>` : ''}
          ${b1.items && b1.items.length > 0 ? `
            <div style="font-size:9.5pt;color:#334155;border-top:1pt solid #e2e8f0;padding-top:4pt;margin-top:4pt;">
              <ul style="margin:2pt 0 0 14pt;padding:0;">
                ${b1.items.map(it => `<li style="margin-bottom:2pt;">${it}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </td>
    `

    // Rama 2 (si existe)
    if (b2) {
      html += `
        <td style="width:50%;padding:6pt;vertical-align:top;border:none;">
          <div style="background-color:#f8fafc;border:1pt solid #cbd5e1;border-left:4pt solid #4f46e5;border-radius:4pt;padding:8pt 10pt;">
            <div style="font-size:9pt;font-weight:bold;color:#4f46e5;text-transform:uppercase;margin-bottom:2pt;">
              RAMA ${i + 2}
            </div>
            <div style="font-size:12pt;font-weight:bold;color:#1e293b;margin-bottom:4pt;">
              ${b2.title}
            </div>
            ${b2.description ? `<div style="font-size:10pt;color:#475569;margin-bottom:6pt;">${b2.description}</div>` : ''}
            ${b2.items && b2.items.length > 0 ? `
              <div style="font-size:9.5pt;color:#334155;border-top:1pt solid #e2e8f0;padding-top:4pt;margin-top:4pt;">
                <ul style="margin:2pt 0 0 14pt;padding:0;">
                  ${b2.items.map(it => `<li style="margin-bottom:2pt;">${it}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </td>
      `
    } else {
      html += '<td style="width:50%;border:none;"></td>'
    }

    html += '</tr>'
  }

  html += `
      </table>
    </div>
  `

  return html
}

// ============================
// EXPORTAR DOC (WORD NATIVO)
// ============================

export async function exportDoc(activity) {
  const title = activity.title || 'Actividad Educativa'
  const isMindMap = activity.type === 'Mapa Mental'

  // Generar HTML del cuerpo
  const bodyHtml = convertMarkdownToWordBody(activity.content || '')
  const mindMapHtml = isMindMap ? buildWordMindMapHtml(activity) : ''

  const formattedDate = activity.createdAt
    ? new Date(activity.createdAt).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('es-MX')

  // Documento HTML optimizado para Microsoft Word (.doc)
  const docHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21.59cm 27.94cm;
      margin: 2.5cm 2.5cm 2.5cm 2.5cm;
      mso-header-margin: 35.4pt;
      mso-footer-margin: 35.4pt;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #1e293b;
    }
  </style>
</head>
<body lang="ES-MX">
  <div class="Section1">
    <!-- Encabezado Institucional -->
    <table style="width:100%;border-collapse:collapse;border-bottom:2pt solid #1c335d;padding-bottom:6pt;margin-bottom:12pt;">
      <tr>
        <td style="border:none;padding:0;vertical-align:middle;">
          <div style="font-family:Calibri,Arial,sans-serif;font-size:13pt;font-weight:bold;color:#1c335d;text-transform:uppercase;letter-spacing:0.5pt;">
            UNIVERSIDAD DE COLIMA
          </div>
          <div style="font-family:Calibri,Arial,sans-serif;font-size:9.5pt;font-weight:600;color:#64748b;">
            EdugenAI · Sistema Integral de Gestión Educativa con Inteligencia Artificial
          </div>
        </td>
        <td style="border:none;padding:0;text-align:right;vertical-align:middle;">
          <span style="font-family:Calibri,Arial,sans-serif;display:inline-block;background-color:#eceafc;color:#2b3085;font-weight:bold;font-size:9pt;padding:3pt 8pt;border-radius:4pt;">
            ${activity.type || 'Actividad'}
          </span>
        </td>
      </tr>
    </table>

    <!-- Ficha de Datos / Metadatos de la Materia -->
    <table style="width:100%;border-collapse:collapse;background-color:#f8fafc;border:1pt solid #e2e8f0;margin-bottom:14pt;">
      <tr>
        <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-size:10pt;">
          <strong>Materia:</strong> ${activity.subject || 'General'}
        </td>
        <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-size:10pt;">
          <strong>Nivel Educativo:</strong> ${activity.level || 'Superior'}
        </td>
      </tr>
      <tr>
        <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-size:10pt;">
          <strong>Dificultad:</strong> ${activity.diff || 'Intermedio'}
        </td>
        <td style="padding:6pt 10pt;border:1pt solid #e2e8f0;font-size:10pt;">
          <strong>Fecha:</strong> ${formattedDate}
        </td>
      </tr>
    </table>

    <!-- Título Principal de la Actividad -->
    <h1 style="font-family:Calibri,Arial,sans-serif;font-size:18pt;font-weight:bold;color:#102a45;margin-top:12pt;margin-bottom:8pt;mso-outline-level:1;">
      ${title}
    </h1>

    <!-- Si es Mapa Mental, insertar la estructura visual generada -->
    ${mindMapHtml}

    <!-- Contenido Formateado Completo -->
    ${bodyHtml}
  </div>
</body>
</html>
  `

  const blob = new Blob([docHtml], {
    type: 'application/msword;charset=utf-8',
  })

  saveAs(blob, `${activity.title || 'actividad'}.doc`)
}

// ============================
// EXPORTAR PDF
// ============================

export async function exportPdf(activity) {
  const { default: jsPDF } = await import('jspdf')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function checkPageBreak(neededHeight) {
    if (y + neededHeight > pageHeight - 20) {
      pdf.addPage()
      y = margin + 5
      return true
    }
    return false
  }

  // Encabezado Página 1
  pdf.setFillColor(28, 51, 93) // #1c335d
  pdf.rect(margin, y, contentWidth, 14, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text('UNIVERSIDAD DE COLIMA · EdugenAI', margin + 4, y + 9)
  y += 20

  // Título
  pdf.setTextColor(16, 42, 69)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  const titleLines = pdf.splitTextToSize(activity.title || 'Actividad Educativa', contentWidth)
  pdf.text(titleLines, margin, y)
  y += titleLines.length * 7 + 4

  // Metadatos
  pdf.setFillColor(248, 250, 252)
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD')
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(71, 85, 105)
  pdf.text(`Materia: ${activity.subject || 'General'}   |   Nivel: ${activity.level || 'Superior'}`, margin + 4, y + 6)
  pdf.text(`Tipo: ${activity.type || 'Actividad'}   |   Dificultad: ${activity.diff || 'Intermedio'}`, margin + 4, y + 11)
  y += 20

  // Si es Mapa Mental, renderizar resumen visual de ramas
  if (activity.type === 'Mapa Mental') {
    const { centralNode, branches } = parseMindMap(activity.content, activity.title)
    if (branches.length > 0) {
      checkPageBreak(30)
      pdf.setFillColor(241, 245, 249)
      pdf.setDrawColor(28, 51, 93)
      pdf.setLineWidth(0.5)
      pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.setTextColor(28, 51, 93)
      pdf.text(`NODO CENTRAL: ${centralNode}`, margin + 4, y + 8)
      y += 18

      branches.forEach((b, idx) => {
        checkPageBreak(25)
        pdf.setFillColor(255, 255, 255)
        pdf.setDrawColor(13, 148, 136)
        pdf.setLineWidth(0.8)
        pdf.line(margin, y, margin, y + 12)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        pdf.setTextColor(15, 118, 110)
        pdf.text(`Rama ${idx + 1}: ${b.title}`, margin + 4, y + 5)

        if (b.items && b.items.length > 0) {
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(8.5)
          pdf.setTextColor(71, 85, 105)
          const itemsText = b.items.join('  •  ')
          const itemLines = pdf.splitTextToSize(`• ${itemsText}`, contentWidth - 8)
          pdf.text(itemLines, margin + 4, y + 10)
          y += itemLines.length * 4 + 8
        } else {
          y += 12
        }
      })
      y += 6
    }
  }

  // Contenido Markdown parseado línea a línea
  const rawLines = (activity.content || '').split('\n')
  for (let line of rawLines) {
    const trimmed = line.trim()
    if (!trimmed) {
      y += 2
      continue
    }

    if (trimmed.startsWith('# ')) {
      checkPageBreak(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.setTextColor(16, 42, 69)
      const lines = pdf.splitTextToSize(trimmed.replace(/^#\s+/, ''), contentWidth)
      pdf.text(lines, margin, y)
      y += lines.length * 6 + 3
    } else if (trimmed.startsWith('## ')) {
      checkPageBreak(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(37, 99, 235)
      const lines = pdf.splitTextToSize(trimmed.replace(/^##\s+/, ''), contentWidth)
      pdf.text(lines, margin, y)
      y += lines.length * 5 + 3
    } else if (trimmed.startsWith('### ')) {
      checkPageBreak(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10.5)
      pdf.setTextColor(51, 65, 85)
      const lines = pdf.splitTextToSize(trimmed.replace(/^###\s+/, ''), contentWidth)
      pdf.text(lines, margin, y)
      y += lines.length * 4.5 + 2
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      checkPageBreak(6)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9.5)
      pdf.setTextColor(30, 41, 59)
      const cleanText = trimmed.replace(/^[-*]\s+/, '').replace(/\*\*/g, '')
      const lines = pdf.splitTextToSize(`• ${cleanText}`, contentWidth - 4)
      pdf.text(lines, margin + 2, y)
      y += lines.length * 4.5 + 1.5
    } else if (/^\d+\.\s+/.test(trimmed)) {
      checkPageBreak(6)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9.5)
      pdf.setTextColor(30, 41, 59)
      const cleanText = trimmed.replace(/\*\*/g, '')
      const lines = pdf.splitTextToSize(cleanText, contentWidth - 4)
      pdf.text(lines, margin + 2, y)
      y += lines.length * 4.5 + 1.5
    } else {
      checkPageBreak(6)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9.5)
      pdf.setTextColor(30, 41, 59)
      const cleanText = trimmed.replace(/\*\*/g, '')
      const lines = pdf.splitTextToSize(cleanText, contentWidth)
      pdf.text(lines, margin, y)
      y += lines.length * 4.5 + 2
    }
  }

  // Pie de página con numeración en todas las páginas
  const totalPages = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(148, 163, 184)
    pdf.setDrawColor(226, 232, 240)
    pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)
    pdf.text('EdugenAI · Generador de Actividades Educativas', margin, pageHeight - 7)
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 7)
  }

  pdf.save(`${activity.title || 'actividad'}.pdf`)
}