import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * ErrorBoundary - Catches JavaScript errors anywhere in the child component tree
 * 
 * Prevents the entire app from crashing when a component throws an error.
 * Shows a friendly fallback UI and logs the error for debugging.
 * 
 * Uses react-error-boundary library for reliable error handling.
 * 
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl border border-red-500/30 p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            strokeWidth={2}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Algo salió mal
        </h2>
        
        <p className="text-gray-400 mb-6">
          La aplicación encontró un error inesperado. No te preocupes, tus datos están seguros.
        </p>

        {/* Show error message in development */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
            <p className="text-xs font-mono text-red-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            Intentar de nuevo
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            Recargar página
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Si el problema persiste, intenta limpiar la caché del navegador
        </p>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const handleError = (error: Error, info: { componentStack: string }) => {
    // Log error to console for debugging
    console.error('Error capturado por ErrorBoundary:', error);
    console.error('Component stack:', info.componentStack);
    
    // In production, you could send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: info });
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset app state if needed
        window.location.href = '/';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

