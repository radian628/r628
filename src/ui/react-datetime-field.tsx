import React, { useState } from "react";

export function DateTimeField(props: {
  value: Date;
  setValue: (d: Date) => void;
}) {
  const localDate = new Date(props.value);
  localDate.setMinutes(
    props.value.getMinutes() - props.value.getTimezoneOffset(),
  );
  const [valueTemp, setValueTemp] = useState(
    localDate.toISOString().slice(0, 16),
  );

  return (
    <input
      type="datetime-local"
      value={valueTemp}
      onInput={(e) => {
        setValueTemp(e.currentTarget.value);

        const d = Date.parse(e.currentTarget.value);

        if (!isNaN(d)) {
          props.setValue(new Date(d));
        }
      }}
    />
  );
}
