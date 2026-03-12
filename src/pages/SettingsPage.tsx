import React, { useRef, useState } from 'react';
import { exportAppStateAsBlob, getExportFilename, importAppStateFromFile, resetAppState } from '../storage/import-export';
import { Button } from '../shared/ui/button';
import { Panel } from '../shared/ui/panel';
import { exportEventsJSON, exportEventsCSV } from '../shared/events/event-logger';

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      setStatus({ type: 'info', message: 'Preparing export...' });

      const blob = await exportAppStateAsBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getExportFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus({ type: 'success', message: 'Export completed successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: `Export failed: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportEvents = async (format: 'json' | 'csv') => {
    try {
      setIsProcessing(true);
      setStatus({ type: 'info', message: `Preparing ${format.toUpperCase()} export...` });

      const content = format === 'json' ? await exportEventsJSON() : await exportEventsCSV();
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      a.download = `tasker-events-${timestamp}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus({ type: 'success', message: `Events export (${format.toUpperCase()}) completed.` });
    } catch (error) {
      setStatus({ type: 'error', message: `Events export failed: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setStatus({ type: 'info', message: 'Importing state...' });

      const result = await importAppStateFromFile(file);

      if (result.success) {
        setStatus({
          type: 'success',
          message: result.migratedFromVersion !== undefined && result.migratedFromVersion < 1
            ? 'Import successful (with migration). Reloading...'
            : 'Import successful. Reloading...'
        });

        // Reload to apply changes
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatus({ type: 'error', message: `Import failed: ${result.errors.join(', ')}` });
      }
    } catch (error) {
      setStatus({ type: 'error', message: `Import failed: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset ALL app data, including event history? This cannot be undone.')) return;

    try {
      setIsProcessing(true);
      await resetAppState();
      setStatus({ type: 'success', message: 'Data reset successful. Reloading...' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setStatus({ type: 'error', message: `Reset failed: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="page-shell">
      <p className="eyebrow">User Controls</p>
      <h1>Settings</h1>

      <div className="grid gap-6 mt-8">
        <Panel title="Data Management">
          <p className="text-sm text-muted-foreground mb-4">
            Export your current app state to a JSON file or import a previously saved state.
          </p>

          <div className="flex gap-4 mb-4">
            <Button onClick={handleExport} className="flex-1" disabled={isProcessing}>Export State</Button>
            <div className="flex-1 relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                aria-label="Import State"
                disabled={isProcessing}
              />
              <Button variant="outline" className="w-full" disabled={isProcessing}>Import State</Button>
            </div>
          </div>

          {status && (
            <div className={`mt-4 p-3 rounded text-sm ${status.type === 'success' ? 'bg-green-100 text-green-800' :
              status.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
              {status.message}
            </div>
          )}
        </Panel>

        <Panel title="Events Instrumentation">
          <p className="text-sm text-muted-foreground mb-4">
            Download your activity event stream for analysis or support.
          </p>

          <div className="flex gap-4 mb-4">
            <Button variant="outline" onClick={() => handleExportEvents('json')} className="flex-1" disabled={isProcessing}>
              Export Events (JSON)
            </Button>
            <Button variant="outline" onClick={() => handleExportEvents('csv')} className="flex-1" disabled={isProcessing}>
              Export Events (CSV)
            </Button>
          </div>
        </Panel>

        <Panel title="Danger Zone">
          <p className="text-sm text-muted-foreground mb-4">
            Irreversibly delete all local data, including events, and reset the application to its default state.
          </p>

          <Button variant="destructive" onClick={handleReset} disabled={isProcessing}>
            Reset Application Data
          </Button>
        </Panel>
      </div>
    </section>
  );
}
