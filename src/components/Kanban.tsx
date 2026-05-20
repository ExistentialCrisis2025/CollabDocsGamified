import React, { useState } from "react";

const Kanban = () => {
  type Item = {
    id: string;
    content: string;
  };

  type Column = {
    name: string;
    items: Item[];
  };

  type Columns = {
    todo: Column;
    inProgress: Column;
    done: Column;
  };

  type DraggedItem = {
    columnID: keyof typeof columns;
    item: Item;
  };

  type Priority = "low" | "medium" | "high";

  type Status = "todo" | "in-progress" | "done";

  type Task = {
    user_id: number;
    task_id: number;
    title: string;
    description: string;
    priority: Priority;
    due_date: string;
    xp_reward: number;
    status: Status;
  };

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
    const updatedTasks = [...tasks];

    const task = updatedTasks.find((task) => task.task_id === taskID);
    if (task) {
      task.status = taskStatus;
    }

    setTasks(updatedTasks);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    columnID: keyof typeof columns,
    item: Item,
  ) => {
    setDraggedItem({ columnID, item });
  };

  const handeDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    columnId: keyof typeof columns,
  ) => {
    e.preventDefault();

    if (!draggedItem) return;

    const { columnID: sourceColumnID, item } = draggedItem;

    if (sourceColumnID === columnId) return;

    const updateColumns = { ...columns };

    updateColumns[sourceColumnID].items = updateColumns[
      sourceColumnID
    ].items.filter((i) => i.id != item.id);

    updateColumns[columnId].items.push(item);

    setColumns(updateColumns);
    setDraggedItem(null);
  };

  return <div></div>;
};

export default Kanban;
