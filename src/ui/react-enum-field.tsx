import React from "react";
import { GetSet } from "./react-nested-layout";

export function EnumField<T extends string>(
  props: GetSet<T> & { variants: [T, string][]; type?: "buttons" | "dropdown" },
) {
  if (props.type === "dropdown") {
    return (
      <select
        className="enum-ui-select"
        onChange={(e) => {
          props.setValue(() => e.currentTarget.value as T);
        }}
      >
        {props.variants.map((v) => (
          <option value={v[0]} key={v[0]} title={v[1]}>
            {v[1]}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="enum-ui">
      {props.variants.map((v) => (
        <button
          key={v[0]}
          className={props.value === v[0] ? "selected" : ""}
          onClick={() => {
            props.setValue(() => v[0]);
          }}
        >
          {v[1]}
        </button>
      ))}
    </div>
  );
}
