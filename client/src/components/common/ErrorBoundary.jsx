import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
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

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass-card p-8 rounded-2xl border-maroon-700/50 shadow-glow-maroon">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-maroon-900/40 border border-maroon-600/60 flex items-center justify-center text-maroon-400">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Display Module Interrupted</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              An unexpected graphics or interface error occurred. You can restore the viewport safely.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-medium shadow-lg shadow-maroon-900/40 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Interface</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
