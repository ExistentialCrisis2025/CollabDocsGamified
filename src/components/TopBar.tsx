import { Link } from "react-router-dom";
import { Moon, Sun, UserCircle2, Flame, Settings as SettingsIcon } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

const TopBar = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/users/me/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStreak(response.data?.user?.current_streak || 0);
      } catch (error) {
        console.error(error);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/80">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/30">
          CD
        </div>
        <span className="text-xl font-black text-slate-800 dark:text-white hidden sm:block">
          CollabDocs
        </span>
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
          <UserCircle2 className="h-5 w-5" />
          <span className="hidden sm:block">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default TopBar;