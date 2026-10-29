import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5 mx-auto" style={{ maxWidth: 500 }}>
          <div style={{ fontSize: '4rem' }}>🚫</div>
          <h2 className="mt-3">Access Denied</h2>
          <p className="text-muted">
            You don&apos;t have permission to access this page.
            This area requires <strong>{requiredRole}</strong> privileges.
          </p>
          <a href="/dashboard" className="btn btn-primary mt-3">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
