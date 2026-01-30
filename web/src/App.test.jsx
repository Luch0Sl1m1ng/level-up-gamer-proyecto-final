import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import App from './App'

beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
    })
  )
})

describe('App', () => {
  it('renderiza la aplicación sin errores', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })
})
