import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getCurrentUserRole } from "../lib/auth";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const role = getCurrentUserRole();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
