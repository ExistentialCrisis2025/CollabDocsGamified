import React from "react";
import "../index.css";
import TaskCard from "./TaskCard";

import type { Status, Task } from "./types/types";

type props = {
  title: Status;
  tasks: Task[];
  removeTask: (task_id: number) => void;
  updateTaskStatus: (task_id: number, task_status: Status) => void;
};

const KanbanColumn = (Props: props) => {
  const ColumnStyles = {
    todo: {
      header: "bg-gradient-to-r from-blue-600 to-blue-400",
      border: "border-blue-400",
    },

    "in-progress": {
      header: "bg-gradient-to-r from-yellow-600 to-yellow-400",
      border: "border-yellow-400",
    },

    done: {
      header: "bg-gradient-to-r from-green-600 to-yellow-400",
      border: "border-green-400",
    },
  };

  return (
    <div>
      <h1>{Props.title}</h1>
      <div>
        {Props.tasks.map((task) => (
          <TaskCard
            removeTask={Props.removeTask}
            key={task.task_id}
            task={task}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
