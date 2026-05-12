import { saveActivity, getActivities } from '@/lib/db'

test('guarda y obtiene actividades', () => {
  saveActivity('user1', { id: '1', name: 'Actividad test' })

  const result = getActivities('user1')

  expect(result.length).toBe(1)
  expect(result[0].id).toBe('1')
})