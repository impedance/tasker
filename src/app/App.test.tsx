import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

test('renders Tasker MVP home page by default', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /Tasker MVP/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Campaigns/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument()
})
