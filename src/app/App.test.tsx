import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

test('renders Tasker MVP', () => {
  render(<App />)
  expect(screen.getByText('Tasker MVP')).toBeInTheDocument()
})
