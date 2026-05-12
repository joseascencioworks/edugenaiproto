import md2html from '@/lib/markdown'

test('convierte markdown a html', () => {
  const result = md2html('# Hola')

  expect(result).toContain('<h1')
  expect(result).toContain('Hola')
})