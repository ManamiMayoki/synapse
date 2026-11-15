import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  student: {
    id: 'usr_student_01',
    name: 'Alex Vance',
    email: 'student@synapse.edu',
    role: 'student',
    studentId: 'CSE-2022-042',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  staff: {
    id: 'usr_staff_01',
    name: 'Marcus Holloway',
    email: 'staff@synapse.edu',
    role: 'staff',
    staffId: 'STAFF-LAB-09',
    department: 'CSE Systems & Hardware Ops',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Dr. Evelyn Reed',
    email: 'admin@synapse.edu',
    role: 'admin',
    staffId: 'ADMIN-DIR-01',
    department: 'Department Chair & Lab Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('synapse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem('synapse_user');
        return null;
      }
    }
    return null; // Visitors must sign in or register to access the lab console
  });

  const [token, setToken] = useState(() => localStorage.getItem('synapse_token') || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('synapse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('synapse_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('synapse_token', token);
    } else {
      localStorage.removeItem('synapse_token');
    }
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    // Check demo accounts first
    const matchedRole = Object.keys(DEMO_ACCOUNTS).find(
      (role) => DEMO_ACCOUNTS[role].email.toLowerCase() === email.toLowerCase()
    );

    if (matchedRole) {
      const demoUser = DEMO_ACCOUNTS[matchedRole];
      setUser(demoUser);
      setToken(`synapse_jwt_${matchedRole}_${Date.now()}`);
      return { success: true, user: demoUser };
    }

    // Custom login fallback
    const customUser = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: email.includes('admin') ? 'admin' : email.includes('staff') ? 'staff' : 'student',
      department: 'Computer Science & Engineering',
      studentId: `CSE-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setUser(customUser);
    setToken(`synapse_jwt_custom_${Date.now()}`);
    return { success: true, user: customUser };
  };

  // Register handler
  const register = async (userData) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'student',
      studentId: userData.studentId || `CSE-${Math.floor(1000 + Math.random() * 9000)}`,
      department: userData.department || 'Computer Science & Engineering',
    };
    setUser(newUser);
    setToken(`synapse_jwt_reg_${Date.now()}`);
    return { success: true, user: newUser };
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('synapse_user');
    localStorage.removeItem('synapse_token');
  };

  // Quick switch role utility (for instant evaluation across roles)
  const switchDemoRole = (roleKey) => {
    if (DEMO_ACCOUNTS[roleKey]) {
      setUser(DEMO_ACCOUNTS[roleKey]);
      setToken(`synapse_jwt_${roleKey}_${Date.now()}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'guest',
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
