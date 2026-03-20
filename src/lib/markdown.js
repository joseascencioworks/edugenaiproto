// src/lib/markdown.js
export default function md2html(md) {
  if (!md) return ''
  let h = md
    .replace(/&(?![a-z#\d]+;)/g, '&amp;')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;color:#374151;margin:14px 0 6px">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:16px;font-weight:700;color:#1d4ed8;margin:18px 0 8px;display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:4px;height:16px;background:#2563eb;border-radius:2px;flex-shrink:0"></span>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:20px;font-weight:700;color:#1e1b4b;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #eff6ff">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    .replace(/`(.+?)`/g,           '<code style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;padding:1px 5px;font-size:12px;font-family:monospace">$1</code>')
    .replace(/^---$/gm,            '<hr style="border:none;border-top:1px solid #e5e7eb;margin:14px 0"/>')
    .replace(/^> (.+)$/gm,         '<blockquote style="border-left:3px solid #2563eb;padding:8px 12px;background:#eff6ff;border-radius:0 8px 8px 0;margin:10px 0;color:#374151">$1</blockquote>')

  // Tables
  h = h.replace(/(\|.+\|\n?)+/g, t => {
    const rows = t.trim().split('\n')
    let out = '<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px">'
    rows.forEach((r, i) => {
      if (/^\|[-| :]+\|$/.test(r.trim())) return
      const cells = r.split('|').filter((_, j, a) => j > 0 && j < a.length - 1)
      const tag   = i === 0 ? 'th' : 'td'
      const style = tag === 'th'
        ? 'background:#eff6ff;color:#1e3a8a;font-weight:700;padding:8px 10px;text-align:left;border:1px solid #bfdbfe'
        : 'padding:7px 10px;border:1px solid #e5e7eb'
      out += '<tr>' + cells.map(c => `<${tag} style="${style}">${c.trim()}</${tag}>`).join('') + '</tr>'
    })
    return out + '</table>'
  })

  // Lists
  h = h.replace(/^(\d+)\. (.+)$/gm, '<li class="ol-li">$2</li>')
  h = h.replace(/(<li class="ol-li">.+<\/li>\n?)+/g, m =>
    `<ol style="margin:0 0 10px 18px">${m.replace(/ class="ol-li"/g, '')}</ol>`)
  h = h.replace(/^[-*] (.+)$/gm, '<li class="ul-li">$1</li>')
  h = h.replace(/(<li class="ul-li">.+<\/li>\n?)+/g, m =>
    `<ul style="margin:0 0 10px 18px;list-style:disc">${m.replace(/ class="ul-li"/g, '')}</ul>`)

  // Paragraphs
  h = h.split('\n\n').map(b => {
    b = b.trim(); if (!b) return ''
    if (/^<(h[1-6]|ul|ol|table|blockquote|hr)/.test(b)) return b
    return `<p style="margin-bottom:10px;color:#4b5563;line-height:1.75">${b.replace(/\n/g, ' ')}</p>`
  }).join('\n')

  return h
}
