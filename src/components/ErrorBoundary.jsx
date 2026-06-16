import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isChunkLoadError = this.state.error?.message?.includes('Failed to fetch dynamically imported module');

      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-6">
          <div className="bg-white border border-gray-200 p-6 rounded-xl max-w-md w-full text-center shadow-sm">
            <h2 className="text-red-500 text-base font-semibold mb-3">
              {isChunkLoadError ? 'Something went wrong' : 'Unexpected Error'}
            </h2>

            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              {isChunkLoadError
                ? "The application updated. Please refresh the page to continue."
                : "Something went wrong. Please try again."}
            </p>

            {!isChunkLoadError && this.state.error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-lg text-left overflow-x-auto max-h-[200px]">
                <code className="text-xs text-red-600 font-mono leading-relaxed whitespace-pre-wrap">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium text-sm w-full transition-all active:scale-95 border-none cursor-pointer"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 font-medium text-sm w-full transition-all active:scale-95 border-none cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
