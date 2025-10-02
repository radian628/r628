import React from "react";

export function StringField(props: {
  value: string;
  setValue: (s: string) => void;
  isTextarea?: boolean;
}) {
  if (props.isTextarea) {
    return (
      <textarea
        value={props.value}
        onInput={(e) => {
          props.setValue(e.currentTarget.value);
        }}
      ></textarea>
    );
  }

  return (
    <input
      value={props.value}
      onInput={(e) => {
        props.setValue(e.currentTarget.value);
      }}
    ></input>
  );
}
