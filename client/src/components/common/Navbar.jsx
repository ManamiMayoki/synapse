import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLabData } from '../../context/LabDataContext';
import { 
  Box, 
  LayoutDashboard, 
  Cpu, 
  Wrench, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  Shield, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function Navbar() {
  const { user, role, logout, switchDemoRole } = useAuth();
  const { tickets, workstations } = useLabData();
  const navigate = useNavigate();
  const location = useLocation();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const openTicketsCount = (tickets || []).filter((t) => t.status !== 'resolved').length;
  const faultyStationsCount = (workstations || []).filter(
    (w) => w.status !== 'healthy' && w.status !== 'Working' && w.status !== 'Fixed'
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/lab3d', label: '3D Lab Floor', icon: Box },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'Hardware Checkout', icon: Cpu },
    { to: '/tickets', label: 'Tickets Queue', icon: Wrench, badge: openTicketsCount },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gold-500/15 bg-zinc-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-maroon-700 via-maroon-800 to-gold-700 p-0.5 shadow-glow-maroon transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl font-black bg-gradient-to-tr from-gold-400 to-amber-200 bg-clip-text text-transparent">
                ⚡
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-gold-300 via-amber-200 to-gold-500 bg-clip-text text-transparent">
                SYNAPSE
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest font-bold bg-maroon-700/30 text-gold-300 border border-gold-500/20 rounded">
                CSE 3D
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-tight">
              Lab & Asset Management System
            </p>
          </div>
        </div>

        {/* Central Navigation Pills */}
        <nav className="hidden md:flex items-center space-x-1 bg-zinc-900/60 p-1 rounded-xl border border-white/5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-maroon-800/80 to-gold-800/60 text-white shadow-sm border border-gold-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-300' : 'text-slate-400'}`} />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-maroon-600 text-white animate-pulse">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Section: Role Switcher & User Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Quick Demo Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-gold-500/30 hover:border-gold-400 text-xs text-slate-200 transition-all shadow-sm"
              title="Click to switch demo role (Student / Staff / Admin)"
            >
              <Shield className="w-3.5 h-3.5 text-gold-400" />
              <span className="font-semibold capitalize text-gold-300">
                {role}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Role Dropdown */}
            {roleMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-xl glass-card bg-zinc-950/95 border-gold-500/30 shadow-2xl py-2 z-50 text-xs"
                onMouseLeave={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Switch Role</span>
                  <Sparkles className="w-3 h-3 text-gold-400" />
                </div>

                <button
                  onClick={() => { switchDemoRole('student'); setRoleMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-2.5 hover:bg-white/5 transition-colors ${role === 'student' ? 'text-gold-400 font-bold bg-gold-500/10' : 'text-slate-300'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <div className="flex-1">
                    <p className="font-medium">Student (Alex Vance)</p>
                    <p className="text-[10px] text-slate-400">Submit tickets, borrow gear</p>
                  </div>
                </button>

                <button
                  onClick={() => { switchDemoRole('staff'); setRoleMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-2.5 hover:bg-white/5 transition-colors ${role === 'staff' ? 'text-gold-400 font-bold bg-gold-500/10' : 'text-slate-300'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <div className="flex-1">
                    <p className="font-medium">Lab Assistant (Marcus H.)</p>
                    <p className="text-[10px] text-slate-400">Triage tickets, manage stock</p>
                  </div>
                </button>

                <button
                  onClick={() => { switchDemoRole('admin'); setRoleMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-2.5 hover:bg-white/5 transition-colors ${role === 'admin' ? 'text-gold-400 font-bold bg-gold-500/10' : 'text-slate-300'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-maroon-400"></span>
                  <div className="flex-1">
                    <p className="font-medium">Admin (Dr. Evelyn Reed)</p>
                    <p className="text-[10px] text-slate-400">Predictive AI, RBAC, analytics</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gold-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-maroon-800 border border-gold-500/40 flex items-center justify-center text-xs font-bold text-gold-300">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-maroon-400 hover:bg-maroon-950/30 transition-colors"
              title="Log out of Synapse"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Nav strip */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 py-2 px-2 bg-zinc-950/90 text-xs">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.to);
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center space-y-1 py-1 px-2 rounded ${
                isActive ? 'text-gold-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </header>
  );
}
