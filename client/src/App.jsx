import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Cpu, HardDrive, Terminal, Layers } from 'lucide-react';

export default function App() {
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      const startTime = performance.now();
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setServerStatus(data.status || 'UP');
          setLatency(Math.round(performance.now() - startTime));
        } else {
          setServerStatus('Degraded');
        }
      } catch (err) {
        setServerStatus('Offline (Standby)');
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-xl font-black text-slate-950">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Synapse
              </h1>
              <p className="text-xs text-slate-400">CSE Department Lab & Asset Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverStatus === 'UP' ? 'bg-teal-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span className="text-slate-300 font-medium">API: {serverStatus}</span>
              {latency !== null && (
                <span className="text-slate-500">({latency}ms)</span>
              )}
            </div>
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              Lab-01 Active
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-6">
            <span>🚀 Milestone: Docker Containerization & CI/CD Pipeline</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            Intelligent Computing Lab Operations & Real-Time Monitoring
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Enterprise-grade MERN platform designed for university computer labs. Featuring 3D interactive layout visualizers, smart hardware tracking, and automated maintenance ticketing.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">3D Interactive Lab Layout</h3>
            <p className="text-sm text-slate-400">
              Visual Three.js / React Three Fiber floor map enabling students and staff to pinpoint and report workstation failures.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Hardware Inventory Tracking</h3>
            <p className="text-sm text-slate-400">
              QR-coded checkout workflow for Arduino kits, sensors, and routers with automated audit trails and due-date tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">RBAC & Ticket Management</h3>
            <p className="text-sm text-slate-400">
              Strict role-based access for Students, Lab Assistants, and Admins with real-time incident lifecycle management.
            </p>
          </div>
        </div>

        {/* System Diagnostics / Milestone Badges */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 max-w-4xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Terminal className="w-5 h-5 text-teal-400" />
              <div>
                <p className="text-sm font-semibold text-white">Lab-01 Architecture Verified</p>
                <p className="text-xs text-slate-400">Dockerized Client & Server • GitHub Actions CI/CD ready</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Docker</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">React 18</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Node/Express</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">MongoDB</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>Synapse Lab Management System • CSE Department Academic Project • 2026</p>
      </footer>
    </div>
  );
}
