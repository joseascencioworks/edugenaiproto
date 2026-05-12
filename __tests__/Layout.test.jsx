import { render, screen, fireEvent } from '@testing-library/react'
import Layout from '../src/components/Layout'

jest.mock('../src/lib/session', () => ({
  clearSession: jest.fn(),
}))

describe('Layout', () => {
  it('renderiza navegación', () => {
    render(<Layout user={{ name: 'Test' }}>Hola</Layout>)
    expect(screen.getByText('Hola')).toBeInTheDocument()
  })

  it('logout funciona', () => {
    const { clearSession } = require('../src/lib/session')

    render(<Layout user={{ name: 'Test' }}>Hola</Layout>)
    fireEvent.click(screen.getByText(/logout/i))

    expect(clearSession).toHaveBeenCalled()
  })
})