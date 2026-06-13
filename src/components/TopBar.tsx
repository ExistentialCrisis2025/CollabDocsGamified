import { Link } from "react-router-dom";
import {
  Moon,
  Sun,
  UserCircle2,
  Flame,
  Settings as SettingsIcon,
  Calendar,
} from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthToken } from "../utils/authToken";

const TopBar = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const [streak, setStreak] = useState(0);
  const username = localStorage.getItem("username") || "default";

  const [calendarConnected, setCalendarConnected] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = getAuthToken();
        const response = await api.get("/users/me/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStreak(response.data?.user?.current_streak || 0);
      } catch (error) {
        console.error(error);
      }
    }
    
    async function fetchCalendarStatus() {
      try {
        const token = getAuthToken();
        const response = await api.get("/calendar/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCalendarConnected(response.data?.connected || false);
      } catch (error) {
        console.error("Failed to fetch calendar status", error);
      }
    }
    
    fetchDashboard();
    fetchCalendarStatus();
  }, []);

  const handleCalendarConnect = () => {
    if (calendarConnected) return;
    const token = getAuthToken();
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${baseUrl}/calendar/auth?token=${token}`;
  };

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/80">
      <Link to="/dashboard" className="flex items-center gap-2 transition hover:opacity-80">
        <div className="flex items-center justify-center">
          <span className="bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-2xl font-black tracking-tighter text-transparent">
            Task Forge
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {streak > 0 && (
          <AnimatePresence>
            <motion.div
              key={streak}
              initial={{ scale: 1.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-500 shadow-sm dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400"
            >
              <Flame className="h-4 w-4 animate-pulse" />
              <span>{streak}</span>
            </motion.div>
          </AnimatePresence>
        )}

        <button
          onClick={toggleTheme}
          className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 hover:scale-105 active:scale-95"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          onClick={handleCalendarConnect}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:scale-105 active:scale-95 ${
            calendarConnected
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:block">
            {calendarConnected ? "Connected to Calendar" : "Connect Calendar"}
          </span>
        </button>

        <Link
          to="/settings"
          className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 hover:scale-105 active:scale-95"
        >
          <SettingsIcon className="h-5 w-5" />
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 hover:scale-105 active:scale-95"
        >
          <img
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${username}&backgroundColor=6366f1`}
            alt="avatar"
            className="h-6 w-6 rounded-full"
          />
          <span className="hidden sm:block">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
