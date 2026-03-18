import React from "react";
import { GetSet } from "./react-nested-layout";

export function EnumField<T extends string | number>(
  props: GetSet<T> & { variants: [T, string][] },
) {
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
