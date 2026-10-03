import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  return isAuthenticated ? <Navigate to="/groups" replace /> : <Outlet />;
}