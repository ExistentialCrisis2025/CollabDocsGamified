import { useEffect, useState } from "react";

import api from "../api/axios";

import { Play, Pause, RotateCcw, Timer } from "lucide-react";

type Props = {
  taskId: number | null;
  taskTitle: string;
};

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

const PomodoroTimer = ({ taskId, taskTitle }: Props) => {
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_DURATION);

  const [isRunning, setIsRunning] = useState(false);

  const [isBreak, setIsBreak] = useState(false);

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
          duration: isBreak ? BREAK_DURATION : FOCUS_DURATION,
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

      setSecondsLeft(BREAK_DURATION);
    } else {
      setIsBreak(false);

      setSecondsLeft(FOCUS_DURATION);
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

    setSecondsLeft(FOCUS_DURATION);
  }

  return (
    <div
      className="
            rounded-2xl border
            border-zinc-700
            bg-zinc-900/80
            p-6 shadow-xl
         "
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className="
                  rounded-xl
                  bg-red-500/20
                  p-3
               "
        >
          <Timer className="h-7 w-7 text-red-400" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">Pomodoro Focus</h2>

          <p className="text-sm text-zinc-400">
            {taskTitle || "No task selected"}
          </p>
        </div>
      </div>

      <div className="text-center">
        <div
          className={`
                  text-7xl font-black

                  ${isBreak ? "text-green-400" : "text-red-400"}
               `}
        >
          {formatTime(secondsLeft)}
        </div>

        <div className="mt-3 text-zinc-400">
          {isBreak ? "Break Time" : "Focus Session"}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="
                  flex items-center gap-2
                  rounded-xl
                  bg-red-500 px-5 py-3
                  font-bold text-white
                  transition hover:scale-105
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
                  bg-zinc-700 px-5 py-3
                  font-bold text-white
                  transition hover:bg-zinc-600
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
