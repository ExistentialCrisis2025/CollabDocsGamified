import type { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  if (authToken) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;
