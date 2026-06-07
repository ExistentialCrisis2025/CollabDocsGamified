import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../utils/authToken";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = getAuthToken();

  if (token?.trim()) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;
