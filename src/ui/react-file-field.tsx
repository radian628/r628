import React from "react";

export function FileField(props: {
  value: Blob | undefined;
  setValue: (s: (old: Blob | undefined) => Blob | undefined) => void;
  isTextarea?: boolean;
}) {
  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.currentTarget.files[0];
        if (file) {
          props.setValue(() => file);
        }
      }}
    ></input>
  );
}
