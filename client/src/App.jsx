import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LabDataProvider } from './context/LabDataContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import LabCanvas from './components/lab3d/LabCanvas';
import DashboardRouter from './components/dashboard/DashboardRouter';
import InventoryPage from './components/dashboard/InventoryPage';
import TicketsPage from './components/dashboard/TicketsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <LabDataProvider>
            <BrowserRouter>
              <div className="h-screen w-screen bg-zinc-975 text-slate-100 flex flex-col font-sans selection:bg-gold-500/30 selection:text-gold-200 overflow-hidden">
                <Navbar />

                <main className="flex-1 w-full relative min-h-0 overflow-hidden">
                  <Routes>
                    {/* Public Auth Routes */}
                    <Route
                      path="/login"
                      element={
                        <div className="w-full h-full overflow-y-auto">
                          <Login />
                        </div>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <div className="w-full h-full overflow-y-auto">
                          <Register />
                        </div>
                      }
                    />

                    {/* 3D Interactive Lab Twin - Full Page / Full Viewport */}
                    <Route
                      path="/lab3d"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <LabCanvas />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />

                    {/* Role-Based Dynamic Dashboards */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <div className="w-full h-full overflow-y-auto">
                            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
                              <DashboardRouter />
                            </div>
                          </div>
                        </ProtectedRoute>
                      }
                    />

                    {/* Hardware Inventory Catalog */}
                    <Route
                      path="/inventory"
                      element={
                        <ProtectedRoute>
                          <div className="w-full h-full overflow-y-auto">
                            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
                              <InventoryPage />
                            </div>
                          </div>
                        </ProtectedRoute>
                      }
                    />

                    {/* Maintenance Incident Tickets */}
                    <Route
                      path="/tickets"
                      element={
                        <ProtectedRoute>
                          <div className="w-full h-full overflow-y-auto">
                            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
                              <TicketsPage />
                            </div>
                          </div>
                        </ProtectedRoute>
                      }
                    />

                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/lab3d" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </LabDataProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
