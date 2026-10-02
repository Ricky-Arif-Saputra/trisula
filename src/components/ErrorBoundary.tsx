import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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
      return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-4 font-sans mt-8">
          <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border-2 border-rose-200 flex flex-col gap-4 text-left shadow-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-rose-500">warning</span>
              <h3 className="font-bold text-lg">Terjadi Kesalahan (Runtime Crash)</h3>
            </div>
            <p className="text-sm font-semibold bg-white p-3 rounded-lg border border-rose-100 text-rose-700 break-words font-mono">
              {this.state.error?.message || 'Error yang tidak diketahui'}
            </p>
            <p className="text-xs text-rose-500">
              Sistem telah mendeteksi kesalahan teknis pada komponen ini. Silakan kembali ke menu sebelumnya.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
