import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * @component ErrorBoundary
 * @description Catches and displays errors that occur in the application.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      
      // Check if the error is a Firestore permission error (JSON string)
      try {
        const parsedError = JSON.parse(this.state.error?.message || "");
        if (parsedError.error && parsedError.error.includes("insufficient permissions")) {
          errorMessage = "You don't have permission to perform this action. Please check your account settings.";
        }
      } catch (e) {
        // Not a JSON error, use default message
      }

      return (
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-3xl font-serif italic mb-4 text-[#1A1A1A]">Oops!</h2>
            <p className="text-gray-500 mb-8">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#5A5A40] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#4A4A30] transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
