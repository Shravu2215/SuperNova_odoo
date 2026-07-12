import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Catches React errors and displays them gracefully
 * Prevents white screen of death
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
          <div className="max-w-md rounded-xl border border-red-800 bg-red-950 p-8 shadow-xl">
            <div className="mb-4 text-3xl">⚠️</div>
            <h2 className="mb-2 text-xl font-semibold text-red-200">
              Something went wrong
            </h2>
            <p className="mb-4 text-sm text-red-300">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="mb-3 max-h-32 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
              <code>{this.state.error?.stack}</code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-red-600 py-2.5 font-medium text-white transition hover:bg-red-700"
            >
              Reload Page
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-2 w-full rounded-lg border border-red-700 py-2.5 font-medium text-red-200 transition hover:bg-red-900/20"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
