import { useState } from "react";
import { useEffect } from "react";

import api from "../api/axios";
import AuthLayout from "../layouts/AuthLayout";
import AuthMessageBanner from "../components/AuthMessageBanner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuthToken, setAuthToken } from "../utils/authToken";
import { Eye, EyeOff } from "lucide-react";

const oauthErrorMessages: Record<string, string> = {
  oauth_denied: "Google sign-in was cancelled. You can try again whenever you are ready.",
  oauth_invalid: "Google sign-in could not be verified. Please try again.",
  oauth_state: "Your Google sign-in session expired. Please start again.",
  oauth_config: "Google sign-in is not configured correctly yet.",
  oauth_token: "Google sign-in could not create a session. Please try again.",
  oauth_profile: "Google could not share the profile details needed to sign you in.",
  oauth_server: "Google sign-in is temporarily unavailable. Please try again shortly.",
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { error?: string } } };
  return apiError.response?.data?.error || fallback;
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = getAuthToken();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate, token]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setBannerMessage(
        oauthErrorMessages[error] || "Sign-in could not be completed. Please try again.",
      );
    }
  }, [searchParams]);

  function handleEmailInput(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    setBannerMessage("");
  }

  function handlePasswordInput(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    setBannerMessage("");
  }

  function handleRemember() {
    setRemember((prev) => !prev);
  }

  function handleClick() {
    navigate("/signup");
  }

  function handleGoogleLogin() {
    const baseURL = api.defaults.baseURL || "http://localhost:5000";
    window.location.href = `${baseURL}/auth/google`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) {
      setBannerMessage("Enter your email address to log in.");
      return;
    }

    if (!email.includes("@")) {
      setBannerMessage("Enter a valid email address.");
      return;
    }

    if (!password) {
      setBannerMessage("Enter your password to log in.");
      return;
    }

    const userData = {
      email: email,
      password: password,
    };

    try {
      const response = await api.post("/login", userData);
      console.log("Success:", response.data);
      setAuthToken(response.data.token, remember);

      setEmail("");
      setPassword("");
      setRemember(false);
      
      localStorage.setItem("username", response.data.user.username);

      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
      setBannerMessage(
        getApiErrorMessage(error, "Invalid credentials. Please check your email and password."),
      );
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400">
            Log In
          </p>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="text-sm text-slate-400">Log in to your account.</p>
        </div>

        <AuthMessageBanner
          message={bannerMessage}
          onDismiss={() => setBannerMessage("")}
        />

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80"
            >
              Email Address
            </label>

            <input
              type="email"
              placeholder="name@example.com"
              name="email"
              required
              onChange={handleEmailInput}
              value={email}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>

          <div>
            <label
              htmlFor="psw"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80"
            >
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                name="psw"
                required
                onChange={handlePasswordInput}
                value={password}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={handleRemember}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-cyan-400 transition hover:text-cyan-300"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Log in
        </button>

        <div className="border-t border-slate-800 pt-4 text-center text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          Or continue with
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          Continue with Google
        </button>

        <div className="border-t border-slate-800 pt-4 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <span
            onClick={handleClick}
            className="cursor-pointer font-semibold text-cyan-400 transition hover:text-cyan-300"
          >
            Sign up
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
