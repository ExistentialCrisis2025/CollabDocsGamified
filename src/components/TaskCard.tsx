import React from "react";

import type { Status, Task } from "./types/types";
import { stat } from "fs";

type prop = {
  task: Task;
  removeTask: (task_id: number) => void;
  updateTaskStatus: (task_id: number, task_status: Status) => void;
};

const TaskCard = (Prop: prop) => {
  const taskStatus = Prop.task.status;

  const statuses: Status[] = ["todo", "in-progress", "done"];

  const statusNeeded = statuses.filter((stat) => stat !== taskStatus);

  return (
    <div>
        {Prop.task.title}
      {Prop.task.description}
      {Prop.task.priority}
      {Prop.task.xp_reward}
      {Prop.task.due_date}
      <button onClick={() => Prop.removeTask(Prop.task.task_id)}>Delete</button>

      {statusNeeded.map((stat) => (
        <button
          key={stat}
          onClick={() => Prop.updateTaskStatus(Prop.task.task_id, stat)}
        >
          Move to {stat}
        </button>
      ))}
    </div>
  );
};

export default TaskCard;
