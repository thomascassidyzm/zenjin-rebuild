/**
 * Admin Context Module
 * 
 * APML v3.1 compliant context boundary for all administrative components
 * This module is lazy-loaded only when admin access is required
 */

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingInterface from '../components/LoadingInterface';
import AdminRouter from '../components/Admin/AdminRouter';
import AdminEntryPoint from '../components/AdminEntryPoint';

interface AdminContextProps {
  userSession: any;
  isAdmin: boolean;
}

/**
 * Admin Context Component
 * Encapsulates all admin-related functionality in a single context boundary
 */
export const AdminContext: React.FC<AdminContextProps> = ({
  userSession,
  isAdmin
}) => {
  // Validate admin access
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-context">
      <Suspense fallback={<LoadingInterface context={{ source: 'admin' }} />}>
        <Routes>
          <Route path="/*" element={<AdminRouter />} />
        </Routes>
      </Suspense>
    </div>
  );
};

// Export the context as default for lazy loading
export default AdminContext;