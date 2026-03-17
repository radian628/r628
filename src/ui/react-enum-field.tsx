import React from "react";
import { GetSet } from "./react-nested-layout";

export function EnumField<T>(props: GetSet<T> & { variants: [T, string][] }) {
  return (
    <div className="enum-ui">
      {props.variants.map((v) => (
        <button
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
