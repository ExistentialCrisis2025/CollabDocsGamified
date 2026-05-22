import { useEffect, useState, useRef } from "react";
import type { Priority, Status, Task } from "./types/types";
import api from "../api/axios";

import KanbanColumn from "./KanbanColumn";
import { DragDropContext } from "@hello-pangea/dnd";

const Kanban = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [xpReward, setXpReward] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const loadRef = useRef(false);

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

  const columns = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  const addNewTask = async () => {
    if (!title.trim()) return;

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

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setXpReward(0);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
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
    } catch (error) {
      console.error("Error removing task:", error);
      alert("Failed to delete task");
    }
  };

  const updateTaskStatus = async (taskID: number, taskStatus: Status) => {
    const previousTasks = tasks;

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
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <h1 className="bg-linear-to-r from-yellow-400 via-orange-500 to-rose-500 bg-clip-text text-center text-5xl font-extrabold tracking-tight text-transparent md:text-6xl">
          Task Board
        </h1>

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
            className="mt-6 w-full rounded-xl bg-linear-to-r from-yellow-500 to-orange-500 px-4 py-3 font-bold text-black transition hover:scale-[1.01]"
          >
            Add Task
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
