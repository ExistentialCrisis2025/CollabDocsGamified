import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
      return;
    }

    navigate(error ? `/login?error=${error}` : "/login", { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-4 text-center text-sm">
        Finalizing secure session...
      </div>
    </div>
  );
};

export default OAuthCallback;
