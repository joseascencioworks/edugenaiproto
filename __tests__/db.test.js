import { saveActivity, getActivities } from '@/lib/db'

test('guarda y obtiene actividades', async () => {
  await saveActivity('user1', { id: '1', name: 'Actividad test' })

  const result = await getActivities('user1', { forceRefresh: true })

  expect(result.length).toBe(1)
  expect(result[0].id).toBe('1')
})