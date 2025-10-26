import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

type Task = string | (() => Promise<any>);

export function ProgressBar(props: { tasks: Task[] }) {
  const { tasks } = props;

  const [currTaskIndex, setCurrTaskIndex] = useState(0);

  const [caption, setCaption] = useState("Progress");

  useEffect(() => {
    const currTask = tasks.at(currTaskIndex);
    if (currTask !== undefined) {
      if (typeof currTask == "string") {
        setCaption(currTask);
        setCurrTaskIndex((c) => c + 1);
      } else {
        currTask().finally(() => {
          setCurrTaskIndex((c) => c + 1);
        });
      }
    }
  }, [currTaskIndex]);

  return (
    <div>
      <div>{caption}</div>
      <div
        style={{
          width: "50vw",
          height: "3rem",
          border: "1px solid black",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${100 * (currTaskIndex / tasks.length)}%`,
            backgroundColor: "black",
          }}
        ></div>
      </div>
    </div>
  );
}

export function simpleProgressBar(tasks: Task[]) {
  const progressBarContainer = document.createElement("div");
  document.body.appendChild(progressBarContainer);
  createRoot(progressBarContainer).render(
    <ProgressBar tasks={tasks}></ProgressBar>
  );
}
