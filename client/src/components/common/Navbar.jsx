import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLabData } from '../../context/LabDataContext';
import { 
  Box, 
  LayoutDashboard, 
  Cpu, 
  Wrench, 
  LogOut, 
  ChevronDown, 
  Shield, 
  Sparkles,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Navbar() {
  const { user, role, isAuthenticated, logout, switchDemoRole } = useAuth();
  const { tickets, workstations } = useLabData();
  const navigate = useNavigate();
  const location = useLocation();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const openTicketsCount = (tickets || []).filter((t) => t.status !== 'resolved').length;

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-maroon-700 via-maroon-800 to-gold-600 p-0.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <span className="text-xl font-black text-maroon-700">
                ⚡
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                SYNAPSE
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono uppercase tracking-wider font-bold bg-maroon-50 text-maroon-800 border border-maroon-200 rounded-md">
                CSE 3D
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              Lab & Asset Management System
            </p>
          </div>
        </div>

        {/* Central Navigation Pills (Only when authenticated) */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-maroon-800 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-maroon-700' : 'text-slate-500'}`} />
                  <span>{link.label}</span>
                  {link.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        ) : null}

        {/* Right Section: Sign In / Register OR Role Switcher & Profile */}
        <div className="flex items-center space-x-3">
          {!isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <NavLink
                to="/login"
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/login'
                    ? 'bg-slate-100 text-maroon-800 font-bold border border-slate-300'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LogIn className="w-4 h-4 text-maroon-700" />
                <span>Sign In</span>
              </NavLink>
              <NavLink
                to="/register"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-maroon-700 hover:bg-maroon-800 text-white shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </NavLink>
            </div>
          ) : (
            <>
              {/* Quick Demo Role Switcher Pill */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 hover:border-slate-400 text-xs text-slate-800 transition-all shadow-xs"
                  title="Click to switch role (Student / Staff / Admin)"
                >
                  <Shield className="w-4 h-4 text-maroon-700" />
                  <span className="font-bold capitalize text-slate-800">
                    {role}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Role Dropdown */}
                {roleMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs"
                    onMouseLeave={() => setRoleMenuOpen(false)}
                  >
                    <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Switch Role</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </div>

                    <button
                      onClick={() => { switchDemoRole('student'); setRoleMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 flex items-center space-x-2.5 hover:bg-slate-50 transition-colors ${role === 'student' ? 'text-maroon-800 font-bold bg-maroon-50' : 'text-slate-700'}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Student</p>
                        <p className="text-xs text-slate-500">Alex Vance • CSE-2022-042</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { switchDemoRole('staff'); setRoleMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 flex items-center space-x-2.5 hover:bg-slate-50 transition-colors ${role === 'staff' ? 'text-maroon-800 font-bold bg-maroon-50' : 'text-slate-700'}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Lab Assistant</p>
                        <p className="text-xs text-slate-500">Marcus Holloway • STAFF-09</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { switchDemoRole('admin'); setRoleMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 flex items-center space-x-2.5 hover:bg-slate-50 transition-colors ${role === 'admin' ? 'text-maroon-800 font-bold bg-maroon-50' : 'text-slate-700'}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Administrator</p>
                        <p className="text-xs text-slate-500">Dr. Evelyn Reed • DIR-01</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* User Profile & Sign Out */}
              <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-maroon-100 border border-maroon-200 flex items-center justify-center text-xs font-bold text-maroon-800">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}

                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500 capitalize">{role}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Mobile Nav strip (Only when authenticated) */}
      {isAuthenticated && (
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 py-2 px-2 bg-white text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-lg ${
                  isActive ? 'text-maroon-800 font-bold bg-maroon-50' : 'text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}
