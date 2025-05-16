import { CenterWrapper } from "@/components/custom ui/center-page";
import { Loader } from "@/components/custom ui/loader";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth";
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, heartbeat, logout } = useAuth(true);
  const location = useLocation();
  const errorMessage = heartbeat.error?.response?.data?.error as string;

  useEffect(() => {
    // Handle session expiration
    if (user && errorMessage === "Session expired or invalidated") {
      toast({
        title: "Session Expired",
        description: "Please login again.",
        variant: "destructive",
      });
      logout();
    }
  }, [errorMessage, user, logout]);

  // If still loading authentication status, show loader
  if (isLoading || heartbeat.isLoading) {
    return (
      <CenterWrapper>
        <Loader />
      </CenterWrapper>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
};
