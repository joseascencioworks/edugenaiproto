import { render } from '@testing-library/react'
import Home from '../src/pages/index'

jest.mock('../src/lib/session', () => ({
  getSession: jest.fn(),
}))

describe('Home', () => {
  it('renderiza sin romper', () => {
    render(<Home />)
  })
})