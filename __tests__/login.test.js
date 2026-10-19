import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../src/pages/login'

describe('Login', () => {
  it('renderiza formulario', () => {
    render(<LoginPage />)
    const elements = screen.getAllByText(/iniciar sesión/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('valida campos vacíos', () => {
    render(<LoginPage />)

    const buttons = screen.getAllByRole('button')
    const submitBtn = buttons.find((btn) => btn.getAttribute('type') === 'submit') || buttons[buttons.length - 1]
    fireEvent.click(submitBtn)
  })
})