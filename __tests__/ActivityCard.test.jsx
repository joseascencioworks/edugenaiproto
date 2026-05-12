import { render, screen, fireEvent } from '@testing-library/react'
import ActivityCard from '../src/components/ActivityCard'

const activity = {
  id: 1,
  title: 'Test',
  type: 'math',
  createdAt: new Date().toISOString(),
}

describe('ActivityCard', () => {
  it('renderiza datos básicos', () => {
    render(<ActivityCard activity={activity} onDelete={() => {}} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('abre modal al hacer click', () => {
    render(<ActivityCard activity={activity} onDelete={() => {}} />)
    
    const btn = screen.getByTitle('Ver')
    fireEvent.click(btn)
  })

  it('llama onDelete', () => {
    const fn = jest.fn()
    render(<ActivityCard activity={activity} onDelete={fn} />)

    const btn = screen.getByTitle('Eliminar')
    fireEvent.click(btn)

    expect(fn).toHaveBeenCalled()
  })
})