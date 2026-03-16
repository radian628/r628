import React from "react";

export function BooleanField(props: {
  value: boolean;
  setValue: (s: (b: boolean) => boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={props.value}
      onChange={(e) => {
        props.setValue(() => e.currentTarget.checked);
      }}
    ></input>
  );
}
