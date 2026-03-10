import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { initStorage, loadAppState, saveAppState } from '../storage/storage'
import { migrate } from '../storage/migrations'

async function bootstrap() {
  try {
    // 1. Initialize core storage (IndexedDB)
    await initStorage();

    // 2. Load existing state for migration check
    const existingState = await loadAppState();
    if (existingState) {
      // 3. Run migrations if needed
      const migratedState = migrate(existingState);
      if (migratedState !== existingState) {
        await saveAppState(migratedState);
      }
    }

    // 4. Seed tutorial if it's the first run
    // Removed automatic loading; now handled by OnboardingDialog in App.tsx
    // await loadTutorialIfFirstRun();

    // 5. Render App
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('[Bootstrap] Critical failure during startup:', error);
    // Basic fallback for MVP: render a simple error message
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h1>Something went wrong</h1>
        <p>Failed to initialize the application storage. Please try reloading.</p>
        <pre style="text-align: left; background: #eee; padding: 10px; display: inline-block;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
}

bootstrap();
