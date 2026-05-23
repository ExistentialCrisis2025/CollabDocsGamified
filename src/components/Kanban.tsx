import { useEffect, useState, useRef } from "react";
import type { Priority, Status, Task } from "./types/types";
import api from "../api/axios";
import XPBar from "./XPBar";
import toast from "react-hot-toast";

import KanbanColumn from "./KanbanColumn";
import { DragDropContext } from "@hello-pangea/dnd";

import { Flame, Star, Trophy } from "lucide-react";

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
    )
      return;

    const newStatus = destination.droppableId as Status;

    await updateTaskStatus(Number(draggableId), newStatus);
  };

  async function fetchTask() {
    const token = localStorage.getItem("authToken");
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
      const token = localStorage.getItem("authToken");

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
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  const addNewTask = async () => {
    if (!title.trim()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
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
        },
      );

      setTasks((prevTasks) => [...prevTasks, response.data]);

      toast.success("Task created successfully!", {
        duration: 2500,
      });

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
      const token = localStorage.getItem("authToken");
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
      const token = localStorage.getItem("authToken");

      await api.patch(
        `/tasks/${taskID}/status`,
        { status: taskStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await prop.fetchDashboard();

      const response = await fetchXP();

      const newXPData = response?.data;

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
      }

      if (newXPData) {
        if (newXPData.level > previousLevel) {
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

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <XPBar
          totalXP={xpData.total_xp}
          nextLevelXP={xpData.next_level_xp}
          level={xpData.level}
        ></XPBar>

        <h1 className="bg-linear-to-r from-yellow-400 via-orange-500 to-rose-500 bg-clip-text text-center text-5xl font-extrabold tracking-tight text-transparent md:text-6xl">
          Task Board
        </h1>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-orange-500/30 bg-zinc-900/80 p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <Flame
                className={`h-8 w-8 ${
                  prop.dashboardData?.user?.current_streak > 0
                    ? "text-orange-500"
                    : "text-zinc-500"
                }`}
              />

              <div>
                <h2 className="text-lg font-bold text-white">Daily Streak</h2>

                <p className="text-sm text-zinc-400">
                  Keep completing tasks daily
                </p>
              </div>
            </div>

            <div className="text-4xl font-black text-white">
              {prop.dashboardData?.user?.current_streak || 0}
            </div>

            <div className="mt-2 text-sm text-zinc-400">
              Best:
              <span className="ml-1 font-semibold text-orange-400">
                {prop.dashboardData?.user?.longest_streak || 0} days
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-500/30 bg-zinc-900/80 p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-400" />

              <div>
                <h2 className="text-lg font-bold text-white">Current Level</h2>

                <p className="text-sm text-zinc-400">Your progression rank</p>
              </div>
            </div>

            <div className="text-4xl font-black text-white">
              {prop.dashboardData?.user?.level || 1}
            </div>

            <div className="mt-2 text-sm text-zinc-400">
              Total XP:
              <span className="ml-1 font-semibold text-yellow-400">
                {prop.dashboardData?.user?.total_xp || 0}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-green-500/30 bg-zinc-900/80 p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-green-400" />

              <div>
                <h2 className="text-lg font-bold text-white">
                  Today's Progress
                </h2>

                <p className="text-sm text-zinc-400">Tasks completed today</p>
              </div>
            </div>

            <div className="text-4xl font-black text-white">
              {prop.dashboardData?.tasks_completed_today || 0}
            </div>

            <div className="mt-2 text-sm text-zinc-400">
              {prop.dashboardData?.completed_today
                ? "🔥 Streak maintained"
                : "Complete a task today"}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-white">
            Welcome back,
            <span className="ml-2 bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {prop.dashboardData?.user?.username || "User"} 👋
            </span>
          </h1>

          <p className="mt-2 text-zinc-400">
            Stay productive and keep your streak alive.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-yellow-500/20 bg-zinc-900/80 p-6 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">XP Progress</h2>

            <span className="text-sm font-semibold text-yellow-400">
              Level {prop.dashboardData?.user?.level || 1}
            </span>
          </div>

          <div className="h-5 w-full overflow-hidden rounded-full bg-zinc-700">
            <div
              className="
            h-full rounded-full
            bg-linear-to-r
            from-yellow-400
            via-orange-500
            to-rose-500

            transition-all
            duration-700
            ease-out

            shadow-[0_0_20px_rgba(249,115,22,0.5)]
         "
              style={{
                width: `${
                  prop.dashboardData?.user?.next_level_xp
                    ? (prop.dashboardData.user.total_xp /
                        prop.dashboardData.user.next_level_xp) *
                      100
                    : 100
                }%`,
              }}
            ></div>
          </div>

          <div className="mt-3 flex justify-between text-sm text-zinc-400">
            <span>{prop.dashboardData?.user?.total_xp || 0} XP</span>

            <span>
              Next Level: {prop.dashboardData?.user?.next_level_xp || "MAX"}
            </span>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6 shadow-xl">
          <h2 className="mb-6 text-2xl font-bold text-white">Today's Tasks</h2>

          <div className="space-y-4">
            {prop.remainingTasks.length > 0 ? (
              prop.remainingTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="
                  rounded-xl border border-zinc-700
                  bg-zinc-800/70
                  p-4 transition-all
               "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">{task.title}</h3>

                      <p className="mt-1 text-sm text-zinc-400">
                        {task.description || "No description"}
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className="
                           rounded-full
                           bg-yellow-500/20
                           px-3 py-1
                           text-xs font-bold
                           text-yellow-400
                        "
                      >
                        {task.status}
                      </div>

                      <div className="mt-2 text-sm text-zinc-400">
                        ⚡ {task.xp_reward} XP
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="
               rounded-xl border border-dashed
               border-green-500/40
               bg-green-500/5
               p-8 text-center
            "
              >
                <div className="mb-3 text-5xl">🎉</div>

                <h3 className="text-xl font-bold text-white">
                  No tasks remaining today!
                </h3>

                <p className="mt-2 text-zinc-400">
                  You've completed everything for today.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6 shadow-2xl">
          <h2 className="mb-6 text-2xl font-bold text-white">
            Create New Task
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-yellow-400"
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-yellow-400"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-120px rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-yellow-400 md:col-span-2"
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-yellow-400"
            />

            <input
              type="number"
              placeholder="XP Reward"
              value={xpReward}
              onChange={(e) => setXpReward(Number(e.target.value))}
              className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-yellow-400"
            />
          </div>

          <button
            onClick={addNewTask}
            className={`mt-6 w-full rounded-xl bg-linear-to-r from-yellow-500 to-orange-500 px-4 py-3 font-bold text-black transition-all ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01]"}`}
            disabled={loading}
          >
            {loading ? "Creating..." : "Add Task"}
          </button>
        </div>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <KanbanColumn
              removeTask={removeTask}
              title={"todo"}
              tasks={columns.todo}
              updateTaskStatus={updateTaskStatus}
            />

            <KanbanColumn
              removeTask={removeTask}
              title={"in-progress"}
              tasks={columns["in-progress"]}
              updateTaskStatus={updateTaskStatus}
            />

            <KanbanColumn
              removeTask={removeTask}
              title={"done"}
              tasks={columns.done}
              updateTaskStatus={updateTaskStatus}
            />
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Kanban;
