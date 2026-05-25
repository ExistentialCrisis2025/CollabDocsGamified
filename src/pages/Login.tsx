import { useState } from "react";
import { useEffect } from "react";

import api from "../api/axios";
import AuthLayout from "../layouts/AuthLayout";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  });

  function handleEmailInput(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handlePasswordInput(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  function handleRemember() {
    setRemember((prev) => !prev);
  }

  function handleClick() {
    navigate("/signup");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const userData = {
      email: email,
      password: password,
    };

    try {
      const response = await api.post("/login", userData);
      console.log("Success:", response.data);
      localStorage.setItem("token", response.data.token);

      setEmail("");
      setPassword("");
      setRemember(false);

      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Invalid credentials");
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>

          <p className="text-gray-400 mt-2">Login to continue</p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter Email"
              name="email"
              required
              onChange={handleEmailInput}
              value={email}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="psw"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password
            </label>

            <input
              type="password"
              placeholder="Enter Password"
              name="psw"
              required
              onChange={handlePasswordInput}
              value={password}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            checked={remember}
            onChange={handleRemember}
            className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
          />

          <label className="text-sm text-gray-300">Remember Me</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-3 rounded-lg"
        >
          Login
        </button>

        <p className="text-center text-gray-400 text-sm">
          Don&apos;t have an account?{" "}
          <span
            onClick={handleClick}
            className="text-blue-500 hover:text-blue-400 cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
