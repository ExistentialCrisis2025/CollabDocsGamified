import { useEffect, useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthMessageBanner from "../components/AuthMessageBanner";
import { getAuthToken, setAuthToken } from "../utils/authToken";
import { Eye, EyeOff } from "lucide-react";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { error?: string } } };
  return apiError.response?.data?.error || fallback;
};

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const navigate = useNavigate();

  const token = getAuthToken();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate, token]);

  function handleUsernameInput(e: React.ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
    setBannerMessage("");
  }

  function handleEmailInput(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    setBannerMessage("");
  }

  function handlePasswordInput(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    setBannerMessage("");
  }

  function handlePasswordConfirmation(e: React.ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(e.target.value);
    setBannerMessage("");
  }

  function handleClick() {
    navigate("/");
  }

  function handleGoogleLogin() {
    const baseURL = api.defaults.baseURL || "http://localhost:5000";
    window.location.href = `${baseURL}/auth/google`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username.trim()) {
      setBannerMessage("Choose a username to create your account.");
      return;
    }

    if (!email.trim()) {
      setBannerMessage("Enter your email address to create your account.");
      return;
    }

    if (!email.includes("@")) {
      setBannerMessage("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setBannerMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setBannerMessage("Passwords do not match. Please retype them.");
      return;
    }

    try {
      const response = await api.post("/register", {
        username,
        email,
        password,
      });
      console.log("Success:", response.data);
      setAuthToken(response.data.token);

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      setBannerMessage(
        getApiErrorMessage(error, "Signup failed. This username may already exist."),
      );
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-indigo-400">
            Sign Up
          </p>
          <h1 className="text-3xl font-bold text-white">Create an account</h1>
          <p className="text-sm text-slate-400">Join the platform to start managing tasks.</p>
        </div>

        <AuthMessageBanner
          message={bannerMessage}
          onDismiss={() => setBannerMessage("")}
        />

        <div className="space-y-4">
          <div>
            <label
              htmlFor="uname"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Username
            </label>

            <input
              type="text"
              placeholder="Choose a username"
              name="uname"
              required
              onChange={handleUsernameInput}
              value={username}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="psw"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                name="psw"
                required
                onChange={handlePasswordInput}
                value={password}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-indigo-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPsw"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Retype your password"
                name="confirmPsw"
                required
                onChange={handlePasswordConfirmation}
                value={confirmPassword}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-indigo-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign up
        </button>

        <div className="border-t border-slate-800 pt-4 text-center text-sm font-medium text-slate-400">
          Or continue with
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-3 text-sm font-semibold text-slate-100 transition hover:border-indigo-400 hover:text-indigo-300"
        >
          Continue with Google
        </button>

        <div className="border-t border-slate-800 pt-4 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <span
            onClick={handleClick}
            className="cursor-pointer font-semibold text-indigo-400 transition hover:text-indigo-300"
          >
            Log in
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
