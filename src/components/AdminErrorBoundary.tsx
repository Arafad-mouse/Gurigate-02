import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary for Admin Panel
 * Catches JavaScript errors in admin components and displays a fallback UI
 * Logs errors for debugging and provides recovery options
 */
export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('Admin Error Boundary caught an error:', error, errorInfo)
    
    // Log to error reporting service (future implementation)
    // logErrorToService(error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    this.setState({
      error,
      errorInfo,
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  private handleGoHome = () => {
    window.location.href = '/admin/dashboard'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isDevelopment = import.meta.env.DEV

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6">
                An error occurred while loading the admin panel. This has been logged for review.
              </p>

              {isDevelopment && this.state.error && (
                <details className="w-full mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="font-bold mb-2">{this.state.error.toString()}</div>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook to programmatically trigger error boundary
 * Usage: throw new AdminError('Custom error message')
 */
export class AdminError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AdminError'
  }
}
