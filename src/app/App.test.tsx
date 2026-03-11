// @vitest-environment jsdom
import { test, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

test('renders Tasker MVP app shell', async () => {
  render(<App />)
  
  // Wait for app to initialize (loading state resolves)
  // Note: OnboardingDialog may appear if no data exists
  await waitFor(() => {
    // Check for either the home page heading or onboarding dialog
    const homeHeading = screen.queryByRole('heading', { name: /Tasker MVP/i })
    const onboardingDialog = screen.queryByRole('dialog', { name: /Choose Your Starting Point/i })
    expect(homeHeading || onboardingDialog).toBeInTheDocument()
  }, { timeout: 2000 })
  
  // Check for TASKER logo (always present in sidebar)
  const logo = screen.getByText('TASKER')
  expect(logo).toBeInTheDocument()
})
