// src/lib/export.js

function sane(n) {
  return (n || 'actividad').replace(/[^a-z0-9áéíóúüñ\s]/gi, '').replace(/\s+/g, '_').toLowerCase().slice(0, 60)
}

// ── PDF ──────────────────────────────────────────────────────────────
export async function exportPdf(activity) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const mx = 18, maxW = W - mx * 2
  let y = 0

  const chk = (n = 10) => { if (y + n > H - 16) { doc.addPage(); y = 18 } }

  // Header band
  doc.setFillColor(37, 99, 235); doc.rect(0, 0, W, 20, 'F')
  doc.setFontSize(9); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold')
  doc.text('EduGenAI', mx, 13); doc.setFont('helvetica', 'normal')
  doc.text('Actividad Educativa con IA', W / 2, 13, { align: 'center' })
  doc.text(new Date().toLocaleDateString('es-MX'), W - mx, 13, { align: 'right' })
  y = 30

  // Title
  doc.setFontSize(17); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 27, 75)
  const tl = doc.splitTextToSize(activity.title, maxW)
  doc.text(tl, mx, y); y += tl.length * 8 + 4

  // Meta
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139)
  const meta = [activity.subject, activity.level, activity.type, activity.diff].filter(Boolean).join('  ·  ')
  doc.text(meta, mx, y); y += 8
  doc.setDrawColor(224, 231, 255); doc.setLineWidth(.4); doc.line(mx, y, W - mx, y); y += 7

  // Content lines
  for (const raw of (activity.content || '').split('\n')) {
    const line = raw.trimEnd(); chk(14)
    if (!line) { y += 3; continue }
    if (line.startsWith('# ')) {
      chk(18); doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 27, 75)
      const w = doc.splitTextToSize(line.slice(2), maxW); doc.text(w, mx, y); y += w.length * 8 + 3
    } else if (line.startsWith('## ')) {
      chk(16); doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(37, 99, 235)
      const w = doc.splitTextToSize(line.slice(3), maxW); doc.text(w, mx, y); y += w.length * 7 + 2
      doc.setDrawColor(191, 219, 254); doc.setLineWidth(.3); doc.line(mx, y, mx + 70, y); y += 3
    } else if (line.startsWith('### ')) {
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(55, 65, 81)
      const w = doc.splitTextToSize(line.slice(4), maxW); doc.text(w, mx, y); y += w.length * 6.5 + 2
    } else if (/^[-*] /.test(line)) {
      doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(55, 65, 81)
      doc.text('•', mx + 2, y)
      const w = doc.splitTextToSize(line.slice(2), maxW - 8); doc.text(w, mx + 8, y); y += w.length * 5.8 + 1
    } else if (/^\d+\. /.test(line)) {
      const n = line.match(/^(\d+)\./)[1]
      doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(55, 65, 81)
      doc.text(`${n}.`, mx + 2, y); doc.setFont('helvetica', 'normal')
      const w = doc.splitTextToSize(line.replace(/^\d+\. /, ''), maxW - 8); doc.text(w, mx + 8, y); y += w.length * 5.8 + 1
    } else {
      const clean = line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
      doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(75, 85, 99)
      const w = doc.splitTextToSize(clean, maxW); doc.text(w, mx, y); y += w.length * 5.8 + 1
    }
  }

  // Footer on every page
  const tot = doc.internal.getNumberOfPages()
  for (let i = 1; i <= tot; i++) {
    doc.setPage(i); doc.setFillColor(248, 250, 252); doc.rect(0, H - 11, W, 11, 'F')
    doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(156, 163, 175)
    doc.text(`EduGenAI  ·  Página ${i} de ${tot}`, W / 2, H - 4, { align: 'center' })
  }
  doc.save(`${sane(activity.title)}.pdf`)
}

// ── DOC (MSWord HTML) ─────────────────────────────────────────────────
export function exportDoc(activity) {
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head><meta charset='utf-8'>
<style>
  body { font-family: Calibri, sans-serif; font-size: 11pt; margin: 2.5cm; }
  h1   { font-size: 18pt; color: #1E1B4B; border-bottom: 2pt solid #E0E7FF; padding-bottom: 4pt; }
  h2   { font-size: 13pt; color: #2563EB; }
  h3   { font-size: 11pt; font-weight: bold; }
  table { border-collapse: collapse; width: 100%; }
  th { background: #EFF6FF; color: #1E3A8A; border: 1px solid #BFDBFE; padding: 6px; }
  td { border: 1px solid #E5E7EB; padding: 5px; }
  tr:nth-child(even) td { background: #F9FAFB; }
  .meta { color: #6B7280; font-size: 9pt; margin-bottom: 12pt; }
</style></head>
<body>
<p class="meta"><b>EduGenAI</b> &nbsp;·&nbsp; ${activity.subject} &nbsp;·&nbsp; ${activity.level} &nbsp;·&nbsp; ${activity.type} &nbsp;·&nbsp; ${new Date(activity.createdAt).toLocaleDateString('es-MX')}</p>
${activity.content
  .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
  .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
  .replace(/^### (.+)$/gm, '<h3>$1</h3>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.+?)\*/g,    '<em>$1</em>')
  .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
  .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
  .replace(/\n\n/g, '</p><p>')}
<hr style="margin-top:24pt;border-color:#E5E7EB"/>
<p style="font-size:8pt;color:#9CA3AF;text-align:center">Generado con EduGenAI · Impulsando la enseñanza con IA</p>
</body></html>`

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: `${sane(activity.title)}.doc` })
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}
