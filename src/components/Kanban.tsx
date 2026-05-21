import React, { useState } from "react";
import type {
  Item,
  Column,
  DraggedItem,
  Priority,
  Status,
  Task,
} from "./types/types";

import KanbanColumn from "./KanbanColumn";

const Kanban = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      user_id: 1,
      task_id: 1,
      title: "Finish Kanban UI",
      description: "Build the frontend board layout",
      priority: "high",
      due_date: "2026-05-20T10:00:00.000Z",
      xp_reward: 100,
      status: "todo",
    },

    {
      user_id: 1,
      task_id: 2,
      title: "Connect Backend API",
      description: "Fetch tasks from Express backend",
      priority: "medium",
      due_date: "2026-05-21T14:00:00.000Z",
      xp_reward: 150,
      status: "in-progress",
    },

    {
      user_id: 1,
      task_id: 3,
      title: "Setup JWT Authentication",
      description: "Store and validate auth tokens",
      priority: "low",
      due_date: "2026-05-18T18:00:00.000Z",
      xp_reward: 80,
      status: "done",
    },
  ]);

  const columns = {
    todo: tasks.filter((task) => task.status === "todo"),
    inProgress: tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);

  const addNewTask = (TaskItem: Task) => {
    const updatedTasks = [...tasks];
    updatedTasks.push(TaskItem);

    setTasks(updatedTasks);
  };

  const removeTask = (taskID: number) => {
    let updatedTasks = [...tasks];

    updatedTasks = updatedTasks.filter((task) => task.task_id !== taskID);

    setTasks(updatedTasks);
  };

  const updateTaskStatus = (taskID: number, taskStatus: Status) => {
    const updatedTasks = tasks.map((task) =>
      task.task_id === taskID ? { ...task, status: taskStatus } : task,
    );

    setTasks(updatedTasks);
  };

  return (
    <div className="p-6 w-full min-h-screen bg-linear-to-b from-zinc-900 to-zinc-800 flex items-center justify-center">
      <div className="flex items-center justify-center flex-col gap-4 w-full max-w-6xl">
        <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-400">
          Task Board
        </h1>

        <div>
          <KanbanColumn
            removeTask={removeTask}
            title={"todo"}
            tasks={columns.todo}
            updateTaskStatus={updateTaskStatus}
          />
          <KanbanColumn
            removeTask={removeTask}
            title={"in-progress"}
            tasks={columns.inProgress}
            updateTaskStatus={updateTaskStatus}
          />
          <KanbanColumn
            removeTask={removeTask}
            title={"done"}
            tasks={columns.done}
            updateTaskStatus={updateTaskStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default Kanban;
