import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import CSS from "./iso-8601.css?raw";
import { DateTimeField } from "../src/ui/react-datetime-field";

const root = document.createElement("div");
document.body.appendChild(root);

createRoot(root).render(<App></App>);

function App() {
  const [date, setDate] = useState(new Date());
  const [copying, setCopying] = useState(false);

  return (
    <div className="converter">
      <style>{CSS}</style>
      <label>Input Date</label>
      <DateTimeField value={date} setValue={setDate}></DateTimeField>
      <label>ISO-8601 Timestamp</label>
      <div className="output">
        {date.toISOString()}
        <button
          style={{ backgroundColor: copying ? "rgb(173, 255, 173)" : "white" }}
          onClick={(e) => {
            (async () => {
              await navigator.clipboard
                .writeText(date.toISOString())
                .catch(() => {
                  window.alert("Failed to copy.");
                });
              setCopying(true);
              setTimeout(() => {
                setCopying(false);
              }, 1000);
            })();
          }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}
