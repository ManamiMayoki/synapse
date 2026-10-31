import React from 'react';
import { AlertOctagon, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Synapse ErrorBoundary Caught]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/lab3d';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-975 flex items-center justify-center p-6 text-center select-none">
          <div className="max-w-lg w-full glass-card p-8 rounded-3xl border border-maroon-700/50 shadow-glow-maroon relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-maroon-900/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-maroon-950/80 border border-maroon-600/60 flex items-center justify-center text-maroon-400 shadow-inner">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
              Display Module Interrupted
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              An unexpected graphics or interface condition occurred. You can safely restore the viewport or return to the department lab selector.
            </p>

            {this.state.error && (
              <div className="mb-6 text-left">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] font-mono text-gold-400 hover:text-gold-300 underline flex items-center space-x-1 mb-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{this.state.showDetails ? 'Hide Diagnostic Trace' : 'View Diagnostic Details'}</span>
                </button>
                {this.state.showDetails && (
                  <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-[10px] text-rose-300 font-mono overflow-x-auto max-h-40 whitespace-pre-wrap">
                    {this.state.error?.toString()}
                    {'\n'}
                    {this.state.error?.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs shadow-lg shadow-maroon-900/40 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Interface</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                <span>Go to Lab 3D Map</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
