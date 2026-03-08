import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

test('renders Capital page by default', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /Capital/i })).toBeInTheDocument()
})
