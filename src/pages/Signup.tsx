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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>

          <p className="text-gray-400 mt-2">Sign up to continue</p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="uname"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Username
            </label>

            <input
              type="text"
              placeholder="Enter Username"
              name="uname"
              required
              onChange={handleUsernameInput}
              value={username}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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

          <div>
            <label
              htmlFor="confirmPsw"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Retype your password"
              name="confirmPsw"
              required
              onChange={handlePasswordConfirmation}
              value={confirmPassword}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-3 rounded-lg"
        >
          Sign Up
        </button>

        <p className="text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <span
            onClick={handleClick}
            className="text-blue-500 hover:text-blue-400 cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
