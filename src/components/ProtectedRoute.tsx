import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import textos from '../content/textos.json';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'host' | 'guest';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  if (!user) {
    // Si no está autenticado, lo enviamos al inicio y notificamos
    return <Navigate to="/" state={{ from: location, needAuth: true }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (requiredRole === 'host') {
      showToast(textos.protectedRoute.hostOnly);
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
