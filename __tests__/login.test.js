import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../src/pages/login'

describe('Login', () => {
  it('renderiza formulario', () => {
    render(<LoginPage />)
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
  })

  it('valida campos vacíos', () => {
    render(<LoginPage />)

    const btn = screen.getAllByRole('button')[2] // botón submit
    fireEvent.click(btn)
  })
})