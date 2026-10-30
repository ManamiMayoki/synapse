import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import StaffDashboard from './StaffDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardRouter() {
  const { role } = useAuth();

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
}
