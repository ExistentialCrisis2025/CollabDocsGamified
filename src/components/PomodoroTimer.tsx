import { useEffect, useState } from "react";

import api from "../api/axios";

import { Settings, Play, Pause, RotateCcw, Timer } from "lucide-react";

type Props = {
  taskId: number | null;
  taskTitle: string;
};

const PomodoroTimer = ({ taskId, taskTitle }: Props) => {
  const [focusConfig, setFocusConfig] = useState(25);
  const [breakConfig, setBreakConfig] = useState(5);

  const [secondsLeft, setSecondsLeft] = useState(focusConfig * 60);

  const [isRunning, setIsRunning] = useState(false);

  const [isBreak, setIsBreak] = useState(false);

  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    // When config changes, if we are not running, update current timer
    if (!isRunning) {
      setSecondsLeft(isBreak ? breakConfig * 60 : focusConfig * 60);
    }
  }, [focusConfig, breakConfig, isBreak, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          handleSessionComplete();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  async function handleSessionComplete() {
    setIsRunning(false);

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/pomodoro/session",
        {
          task_id: taskId,
          duration: isBreak ? breakConfig * 60 : focusConfig * 60,
          session_type: isBreak ? "break" : "focus",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error(error);
    }

    if (!isBreak) {
      setIsBreak(true);
      setSecondsLeft(breakConfig * 60);
    } else {
      setIsBreak(false);
      setSecondsLeft(focusConfig * 60);
    }
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  function resetTimer() {
    setIsRunning(false);

    setIsBreak(false);

    setSecondsLeft(focusConfig * 60);
  }

  return (
    <div
      className="
            relative
            rounded-2xl border
            border-slate-200 dark:border-slate-700
            bg-slate-50 dark:bg-slate-800
            p-6 shadow-xl transition-colors
         "
    >
      <button 
        onClick={() => setShowConfig(!showConfig)}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-500 transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>

      {showConfig && (
        <div className="mb-6 rounded-xl bg-slate-200/50 dark:bg-slate-900/50 p-4 border border-slate-300 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Timer Settings</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Focus (min)</label>
              <input 
                type="number" 
                value={focusConfig} 
                onChange={(e) => setFocusConfig(Number(e.target.value) || 1)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                min="1"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Break (min)</label>
              <input 
                type="number" 
                value={breakConfig} 
                onChange={(e) => setBreakConfig(Number(e.target.value) || 1)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                min="1"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <div
          className="
                  rounded-xl
                  bg-indigo-500/20
                  p-3
               "
        >
          <Timer className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pomodoro Focus</h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {taskTitle || "No task selected"}
          </p>
        </div>
      </div>

      <div className="text-center">
        <div
          className={`
                  text-7xl font-black

                  ${isBreak ? "text-emerald-500 dark:text-emerald-400" : "text-indigo-500 dark:text-indigo-400"}
               `}
        >
          {formatTime(secondsLeft)}
        </div>

        <div className="mt-3 text-slate-500 dark:text-slate-400">
          {isBreak ? "Break Time" : "Focus Session"}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="
                  flex items-center gap-2
                  rounded-xl
                  bg-indigo-500 px-5 py-3
                  font-bold text-white
                  transition hover:scale-105 active:scale-95
                  hover:bg-indigo-600
               "
        >
          {isRunning ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}

          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={resetTimer}
          className="
                  flex items-center gap-2
                  rounded-xl
                  bg-slate-200 dark:bg-slate-700 px-5 py-3
                  font-bold text-slate-700 dark:text-white
                  transition hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95
               "
        >
          <RotateCcw className="h-5 w-5" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
