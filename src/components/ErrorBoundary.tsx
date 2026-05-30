import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-6">
          <span className="text-5xl" aria-hidden="true">⚠️</span>
          <h1 className="text-xl font-bold text-white">Something went wrong</h1>
          <p className="text-sm text-white/50 max-w-sm">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-6 py-2 rounded-full border border-white/20 text-sm text-white hover:bg-white/10 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
