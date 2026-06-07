import { useState, useEffect } from "react";
import { useThemeStore } from "../store/themeStore";
import TopBar from "../components/TopBar";
import { Link } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Bell, Globe } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axios";
import { getAuthToken } from "../utils/authToken";

const Settings = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");

    return saved !== null ? saved === "true" : true;
  });
  const [timezone, setTimezone] = useState(() => {
    const saved = localStorage.getItem("timezone");

    return saved || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });
  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = getAuthToken();
        const response = await api.get("/users/me/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.user?.timezone) {
          setTimezone(response.data.user.timezone);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchSettings();
  }, []);

  const handleNotificationsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.checked;
    setNotifications(val);
    localStorage.setItem("notifications", String(val));
  };

  const handleTimezoneChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const val = e.target.value;

    setTimezone(val);

    localStorage.setItem("timezone", val);

    try {
      const token = getAuthToken();

      await api.patch(
        "/users/me/timezone",
        {
          timezone: val,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (err) {
      console.error("Failed to save timezone", err);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <TopBar />

      <motion.main
        className="mx-auto max-w-4xl p-6 pt-12"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Link
          to="/dashboard"
          className="mb-8 flex w-max items-center gap-2 font-bold text-indigo-500 transition hover:text-indigo-600 dark:text-indigo-300"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>

        <h1 className="mb-8 text-4xl font-black text-slate-900 dark:text-white">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Appearance */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-700">
              <Sun className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-bold">Appearance</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Theme Toggle
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Switch between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-700">
              <Bell className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Email Notifications
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Receive reminders and updates
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={notifications}
                  onChange={handleNotificationsChange}
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:border-gray-600 dark:bg-slate-700 dark:peer-focus:ring-indigo-800"></div>
              </label>
            </div>
          </section>

          {/* Timezone */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-700">
              <Globe className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-bold">Localization</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Timezone
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Set your local timezone for streaks and deadlines
                </p>
              </div>
              <select
                value={timezone}
                onChange={handleTimezoneChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Central Europe (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option
                  value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                >
                  {Intl.DateTimeFormat().resolvedOptions().timeZone} (Auto)
                </option>
              </select>
            </div>
          </section>
        </div>
      </motion.main>
    </div>
  );
};

export default Settings;
