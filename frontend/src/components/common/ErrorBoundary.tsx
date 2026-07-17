"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AppButton } from "./AppButton";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
            <p className="text-sm text-slate-500">An unexpected error occurred. Please try again.</p>
            <AppButton onClick={() => this.setState({ hasError: false })}>Retry</AppButton>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
