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
        <div className="min-h-screen bg-apex-black flex items-center justify-center p-6 apex-grid">
          <div className="glass rounded-[40px] p-12 max-w-md w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl mx-auto mb-8 flex items-center justify-center text-red-500 text-4xl font-black shadow-[0_0_40px_rgba(239,68,68,0.2)]">!</div>
            <h2 className="text-3xl font-bold mb-4 tracking-tighter uppercase">System Failure</h2>
            <p className="text-white/40 mb-10 text-sm leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white text-apex-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Re-Initialize System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
