"use client";

import { useAuth } from "@/lib/auth";
import LoginPage from "./LoginPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-3 border-gov-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gov-text-light">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

