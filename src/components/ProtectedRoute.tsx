import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import { getAuthToken, clearAuthToken } from "../utils/authToken";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">(
    "loading",
  );

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setStatus("invalid");
      return;
    }

    api
      .get("/users/me/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setStatus("valid"))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          clearAuthToken();
          setStatus("invalid");
        } else {
          // 502, network error, backend sleeping — don't clear token
          setStatus("valid");
        }
      });
  }, []);

  if (status === "loading")
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-medium">
            Verifying session...
          </p>
        </div>
      </div>
    );

  if (status === "invalid") return <Navigate to="/login" />;
  return children;
};

export default ProtectedRoute;
