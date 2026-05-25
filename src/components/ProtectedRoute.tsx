import type { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (token) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;
