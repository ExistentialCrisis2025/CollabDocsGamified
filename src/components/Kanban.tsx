import { useEffect, useState, useRef } from "react";
import type { Priority, Status, Task } from "./types/types";
import api from "../api/axios";
import toast from "react-hot-toast";
import LevelUpOverlay from "./LevelUpOverlay";
import { AnimatePresence, motion } from "framer-motion";

import KanbanColumn from "./KanbanColumn";
import { DragDropContext } from "@hello-pangea/dnd";

import { Flame, Star, Trophy, Calendar } from "lucide-react";
import { getAuthToken } from "../utils/authToken";

type Props = {
  fetchDashboard: () => void;
  dashboardData: any;
  remainingTasks: Task[];
};

const Kanban = (prop: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [xpReward, setXpReward] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const loadRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [calendarPrompt, setCalendarPrompt] = useState<{show: boolean, title: string, description: string, date: string | null} | null>(null);

  const [xpData, setXpData] = useState({
    total_xp: 0,
    level: 1,
    next_level_xp: 100,
  });

  const handleOnDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = Number(draggableId);

    const oldStatus = source.droppableId as Status;

    const newStatus = destination.droppableId as Status;

    const originalTasks = [...tasks];

    const cols = {
      todo: tasks
        .filter((t) => t.status === "todo")
        .sort((a, b) => (a.position || 0) - (b.position || 0)),

      "in-progress": tasks
        .filter((t) => t.status === "in-progress")
        .sort((a, b) => (a.position || 0) - (b.position || 0)),

      done: tasks
        .filter((t) => t.status === "done")
        .sort((a, b) => (a.position || 0) - (b.position || 0)),
    };

    const sourceCol = [...cols[oldStatus]];

    const destCol = [...cols[newStatus]];

    const sourceIndex = sourceCol.findIndex((t) => t.id === taskId);

    if (sourceIndex === -1) return;

    const [removedTask] = sourceCol.splice(sourceIndex, 1);

    const updatedTask = {
      ...removedTask,
      status: newStatus,
    };

    if (oldStatus === newStatus) {
      sourceCol.splice(destination.index, 0, updatedTask);
    } else {
      destCol.splice(destination.index, 0, updatedTask);
    }

    const updatedCols = {
      ...cols,
      [oldStatus]: sourceCol,
      [newStatus]: oldStatus === newStatus ? sourceCol : destCol,
    };

    const updatedTodo = updatedCols.todo.map((task, index) => ({
      ...task,
      position: index,
    }));

    const updatedInProgress = updatedCols["in-progress"].map((task, index) => ({
      ...task,
      position: index,
    }));

    const updatedDone = updatedCols.done.map((task, index) => ({
      ...task,
      position: index,
    }));

    const finalTasks = [...updatedTodo, ...updatedInProgress, ...updatedDone];

    setTasks(finalTasks);

    try {
      const token = getAuthToken();

      if (oldStatus !== newStatus) {
        await api.patch(
          `/tasks/${taskId}/status`,
          {
            status: newStatus,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (newStatus === "done") {
          toast.success("XP Gained", {
            duration: 2200,

            style: {
              background: "#27272a",

              color: "#facc15",

              border: "1px solid rgba(250, 204, 21, 0.3)",

              borderRadius: "14px",

              padding: "14px",

              fontWeight: "700",
            },
          });
        }

        const xpResponse = await fetchXP();
        const newXPData = xpResponse?.data;
        if (newXPData) {
          setXpData(newXPData);
        }

        if (newXPData && newXPData.level > xpData.level) {
          toast.success(`Level Up! You reached Level ${newXPData.level}`, {
            duration: 4000,

            style: {
              background: "linear-gradient(to right, #facc15, #f97316)",

              color: "#000",

              fontWeight: "700",

              padding: "18px",

              borderRadius: "18px",

              boxShadow: "0 12px 40px rgba(249, 115, 22, 0.4)",
            },
          });
        }
      }

      const payloadTasks = finalTasks.map((task) => ({
        id: task.id,
        status: task.status,
        position: task.position,
      }));

      await api.patch(
        "/tasks/reorder",
        {
          tasks: payloadTasks,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (err) {
      console.error("Drag and drop failed", err);

      setTasks(originalTasks);

      toast.error("Failed to update task position");
    }
  };

  async function fetchTask() {
    const token = getAuthToken();
    console.log(token);

    try {
      const response = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetchind data due to: ", error);
      alert("There seems to be an error in fetching data, please try later");
    }
  }

  async function fetchXP() {
    try {
      const token = getAuthToken();

      const response = await api.get("/users/me/xp", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.next_level_xp) {
        response.data.next_level_xp = response.data.total_xp;
      }

      setXpData(response.data);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  const columns = {
    todo: tasks
      .filter((task) => task.status === "todo")
      .sort((a, b) => (a.position || 0) - (b.position || 0)),
    "in-progress": tasks
      .filter((task) => task.status === "in-progress")
      .sort((a, b) => (a.position || 0) - (b.position || 0)),
    done: tasks
      .filter((task) => task.status === "done")
      .sort((a, b) => (a.position || 0) - (b.position || 0)),
  };

  const addNewTask = async () => {
    if (!title.trim()) return;
    setLoading(true);

    try {
      const token = getAuthToken();
      const response = await api.post(
        "/tasks",
        {
          title,
          description,
          priority,
          due_date: dueDate || null,
          xp_reward: xpReward,
          status: "todo",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTasks((prevTasks) => [...prevTasks, response.data]);

      toast.success("Task created successfully!", {
        duration: 2500,
      });

      setCalendarPrompt({ show: true, title, description, date: dueDate || null });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setXpReward(0);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const removeTask = async (taskID: number) => {
    try {
      const token = getAuthToken();
      await api.delete(`/tasks/${taskID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let updatedTasks = [...tasks];
      updatedTasks = updatedTasks.filter((task) => task.id !== taskID);
      setTasks(updatedTasks);
      toast.success("Task deleted succesfully", {
        duration: 2000,
      });
    } catch (error) {
      console.error("Error removing task:", error);
      alert("Failed to delete task");
    }
  };

  const updateTaskStatus = async (taskID: number, taskStatus: Status) => {
    const previousTasks = tasks;
    const previousLevel = xpData.level;

    const task = tasks.find((task) => task.id === taskID);
    const previousStatus = task?.status;

    const updatedTasks = tasks.map((task) =>
      task.id === taskID ? { ...task, status: taskStatus } : task,
    );

    setTasks(updatedTasks);

    try {
      const token = getAuthToken();

      const patchResponse = await api.patch(
        `/tasks/${taskID}/status`,
        { status: taskStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { unlockedBadges } = patchResponse.data || {};

      if (taskStatus === "done" && previousStatus !== "done") {
        toast.success(`XP Gained`, {
          duration: 2200,

          style: {
            background: "#27272a",
            color: "#facc15",
            border: "1px solid rgba(250, 204, 21, 0.3)",
            borderRadius: "14px",
            padding: "14px",
            fontWeight: "700",
          },
        });

        if (unlockedBadges && unlockedBadges.length > 0) {
          unlockedBadges.forEach((badge: any) => {
            toast.success(`Badge Unlocked: ${badge.name}!`, {
              icon: "🏅",
              duration: 5000,
              style: {
                background: "#27272a",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "14px",
                padding: "14px",
                fontWeight: "700",
              },
            });
          });
        }
      }

      await prop.fetchDashboard();
      const response = await fetchXP();
      const newXPData = response?.data;
      if (newXPData) {
        setXpData(newXPData);
      }

      if (newXPData && newXPData.level > previousLevel) {
        setNewLevel(newXPData.level);
        setShowLevelUp(true);
      }
    } catch (error) {
      console.error("Error updating task status:", error);

      setTasks(previousTasks);

      alert("Failed to update status");
    }
  };

  useEffect(() => {
    if (!loadRef.current) {
      loadRef.current = true;

      fetchTask();
      fetchXP();
      prop.fetchDashboard();
    }
  }, []);

  const handleCalendarPromptResponse = async (add: boolean) => {
    if (add && calendarPrompt) {
      try {
        const token = getAuthToken();
        await api.post(
          "/calendar/events",
          { title: calendarPrompt.title, description: calendarPrompt.description, date: calendarPrompt.date },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Added to Google Calendar!", { duration: 2500 });
      } catch (calendarError: any) {
        console.error("Error adding to calendar:", calendarError);
        if (calendarError.response?.status === 400) {
          toast.error("Please connect your Google Calendar in the Top Bar first.");
        } else {
          toast.error("Failed to add to calendar.");
        }
      }
    }
    setCalendarPrompt(null);
  };

  return (
    <div className="w-full relative">
      <AnimatePresence>
        {showLevelUp && (
          <LevelUpOverlay
            level={newLevel}
            onClose={() => setShowLevelUp(false)}
          />
        )}
        {calendarPrompt?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4 text-indigo-500">
                <Calendar className="w-8 h-8" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Add to Calendar?</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Do you want to automatically schedule "<span className="font-semibold">{calendarPrompt.title}</span>" in your Google Calendar?
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => handleCalendarPromptResponse(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Not Now
                </button>
                <button
                  onClick={() => handleCalendarPromptResponse(true)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition"
                >
                  Yes, Add It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto flex flex-col gap-8">
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 p-6 shadow-2xl transition-colors">
          <h2 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
            Create New Task
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-indigo-400 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-indigo-400"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-indigo-400 md:col-span-2 lg:col-span-2 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              rows={1}
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-indigo-400"
            />

            <input
              type="number"
              placeholder="XP Reward"
              value={xpReward}
              onChange={(e) => setXpReward(Number(e.target.value))}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-800 dark:text-slate-100 outline-none transition focus:border-indigo-400 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            <button
              onClick={addNewTask}
              className={`w-full rounded-xl bg-linear-to-r from-indigo-500 to-emerald-500 px-4 py-3 font-bold text-white shadow-lg transition-transform md:col-span-2 ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}
              disabled={loading}
            >
              {loading ? "Creating..." : "+ Add Task"}
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Object.entries(columns).map(([stat, items]) => (
              <KanbanColumn
                key={stat}
                tasks={items}
                status={stat as Status}
                title={stat}
                removeTask={removeTask}
                updateTaskStatus={updateTaskStatus}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Kanban;
