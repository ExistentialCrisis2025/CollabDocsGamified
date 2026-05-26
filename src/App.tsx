import "./App.css";

import "./index.css";

import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Analytics from "./pages/Analytics";
import { Toaster } from "react-hot-toast";

import { Routes, Route } from "react-router-dom";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <div>
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid rgba(250, 204, 21, 0.25)",
            padding: "16px",
            borderRadius: "16px",
            fontWeight: "600",
            boxShadow: "0 10px 30px rgba(250, 204, 21, 0.12)",
          },

          success: {
            iconTheme: {
              primary: "#facc15",
              secondary: "#18181b",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        ></Route>
        <Route path="/leaderboard" element={<Leaderboard />}></Route>
        <Route path="/Analytics" element={<Analytics />}></Route>
      </Routes>
    </div>
  );
}
export default App;
