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

  const [columns, setColumns] = useState({
    todo: {
      name: "To Do",
      items: [
        { id: "1", content: "Content 1" },
        { id: "2", content: "Content 2" },
      ],
    },

    inProgress: {
      name: "In Progress",
      items: [{ id: "3", content: "Content 3" }],
    },

    done: {
      name: "Done",
      items: [{ id: "4", content: "Content 4" }],
    },
  });

  const [newTask, setNewTask] = useState("");
  const [activeColumn, setActiveColumn] =
    useState<keyof typeof columns>("todo");

  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);

  const addNewTask = () => {
    if (newTask.trim() === "") {
      return;
    }

    const updatedColumns = { ...columns };

    updatedColumns[activeColumn as keyof typeof columns].items.push({
      id: Date.now().toString(),
      content: newTask,
    });

    setColumns(updatedColumns);

    setNewTask("");
  };

  const removeTask = (columnId: keyof typeof columns, taskID: string) => {
    const updatedColumns = { ...columns };

    updatedColumns[columnId].items = updatedColumns[columnId].items.filter(
      (item) => item.id !== taskID,
    );

    setColumns(updatedColumns);
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

    updatedColumns[columnId].items.push(item);

    setColumns(updateColumns);
    setDraggedItem(null);
  };

  return <div></div>;
};

export default Kanban;
