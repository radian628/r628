import { useEffect, useRef, useState } from "react";

export type NumberFieldProps = {
  value: number;
  setValue: (n: number) => void;
  scale?: "linear" | "log";
  sensitivity?: number;
  min?: number;
  max?: number;
  step?: number;
  offset?: number;
  displayPrecision?: number;
  defaultIfNaN?: number;
};

function stringifyNumber(x: number): string {
  return x.toLocaleString("fullwide", {
    useGrouping: false,
    maximumFractionDigits: 10,
  });
}

function roundAndClamp(
  x: number,
  min: number,
  max: number,
  step: number,
  offset: number
) {
  x = Math.max(Math.min(x, max), min);
  if (step === 0) return x;
  return Math.round((x - offset) / step) * step + offset;
}

export function NumberField(propsOpt: NumberFieldProps) {
  const props: Required<NumberFieldProps> = {
    scale: "log",
    sensitivity: 0.01,
    min: -Infinity,
    max: Infinity,
    step: 0,
    offset: 0,
    displayPrecision: 3,
    defaultIfNaN: 0,
    ...propsOpt,
  };

  const value = isNaN(props.value) ? props.defaultIfNaN : props.value;

  const [valueTemp, _setValueTemp] = useState(stringifyNumber(value));

  const lastNumberRef = useRef(value);

  function constrain(n: number) {
    return roundAndClamp(n, props.min, props.max, props.step, props.offset);
  }

  function setValueTemp(vt: string, forceConstrain: boolean) {
    if (!forceConstrain) _setValueTemp(vt);
    const num = Number(vt);
    if (!isNaN(num)) {
      const cn = constrain(num);
      props.setValue(cn);
      lastNumberRef.current = cn;
      if (forceConstrain) {
        _setValueTemp(stringifyNumber(cn));
      }
    }
  }

  function setValueTempNum(n: number, forceConstrain: boolean) {
    return setValueTemp(
      stringifyNumber(forceConstrain ? constrain(n) : n),
      forceConstrain
    );
  }

  useEffect(() => {
    if (lastNumberRef.current !== value) {
      lastNumberRef.current = value;
      _setValueTemp(stringifyNumber(value));
    }
  }, [value]);

  return (
    <input
      value={valueTemp}
      onInput={(e) => {
        setValueTemp(e.currentTarget.value, false);
      }}
      ref={(e) => {
        e?.addEventListener("change", () => {
          setValueTemp(e.value, true);
        });
      }}
      onMouseDown={async (e) => {
        await e.currentTarget.requestPointerLock();
        let dragnum = value;

        const mousemoveListener = (e: MouseEvent) => {
          const x = e.movementX;
          if (props.scale === "log") {
            dragnum = dragnum * (2 ** props.sensitivity) ** x;
          } else {
            dragnum += x * props.sensitivity;
          }
          setValueTempNum(dragnum, true);
        };
        const mouseupListener = (e2: MouseEvent) => {
          document.removeEventListener("mousemove", mousemoveListener);
          document.removeEventListener("mouseup", mouseupListener);
          document.exitPointerLock();
        };

        document.addEventListener("mousemove", mousemoveListener);
        document.addEventListener("mouseup", mouseupListener);
      }}
    ></input>
  );
}
