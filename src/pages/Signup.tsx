import { useEffect, useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  });

  function handleUsernameInput(e: React.ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
  }

  function handleEmailInput(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handlePasswordInput(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  function handlePasswordConfirmation(e: React.ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(e.target.value);
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

    if (password.length < 8) {
      alert("Password should contain at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await api.post("/register", {
        username,
        email,
        password,
      });
      console.log("Success:", response.data);
      localStorage.setItem("token", response.data.token);

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Signup failed. User might already exist.");
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400">
            Command Enrollment
          </p>
          <h1 className="text-3xl font-black text-white">Apply for Command</h1>
          <p className="text-sm text-slate-400">Join the fleet and start your mission.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="uname"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80"
            >
              Callsign
            </label>

            <input
              type="text"
              placeholder="Choose a callsign"
              name="uname"
              required
              onChange={handleUsernameInput}
              value={username}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80"
            >
              Email Identity
            </label>

            <input
              type="email"
              placeholder="commander@collabdocs.com"
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
              Access Key
            </label>

            <input
              type="password"
              placeholder="Create a secure passphrase"
              name="psw"
              required
              onChange={handlePasswordInput}
              value={password}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPsw"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80"
            >
              Confirm Access Key
            </label>

            <input
              type="password"
              placeholder="Retype your passphrase"
              name="confirmPsw"
              required
              onChange={handlePasswordConfirmation}
              value={confirmPassword}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Initiate Enrollment
        </button>

        <div className="border-t border-slate-800 pt-4 text-center text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          External uplinks
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          Continue with Google
        </button>

        <div className="border-t border-slate-800 pt-4 text-center text-sm text-slate-400">
          Already enlisted?{" "}
          <span
            onClick={handleClick}
            className="cursor-pointer font-semibold text-cyan-400 transition hover:text-cyan-300"
          >
            Return to Login
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
