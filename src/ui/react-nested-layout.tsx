import React, { useState } from "react";
import { createDragContext, DragAndDrop } from "./react-drag-and-drop";

export type GetSet<T> = {
  value: T;
  setValue: (cb: (t: T) => T) => void;
};

export type UIField<T> = React.FC<GetSet<T>>;

export type UIData<F extends UIField<any>> = Parameters<F>[0]["value"];

export function using<T, F extends UIField<T>>(
  F2: F,
  props: Omit<Parameters<F>[0], "value" | "setValue">,
): UIField<Parameters<F>[0]["value"]> {
  return (params) => {
    // @ts-expect-error
    return <F2 {...{ ...props, ...params }}></F2>;
  };
}

export function mutatify<T>(
  c: React.FC<{
    value: T;
    setValue: (t: T) => void;
  }>,
): UIField<T> {
  return (props) =>
    c({
      value: props.value,
      setValue(v) {
        props.setValue(() => v);
      },
    });
}

export function surround<T>(
  Ui: UIField<T>,
  C: React.FC<React.PropsWithChildren>,
): UIField<T> {
  return (props) => (
    <C>{<Ui value={props.value} setValue={props.setValue}></Ui>}</C>
  );
}

export function useprop<Obj, Prop extends keyof Obj>(
  prop: Prop,
  c: UIField<Obj[Prop]>,
): UIField<Obj> {
  return (props) =>
    c({
      value: props.value[prop],
      setValue(v) {
        props.setValue((oldValue) => ({
          ...oldValue,
          [prop]: v(oldValue[prop]),
        }));
      },
    });
}

export function objectUI<F extends Record<string, UIField<any>>>(
  fields: F,
): UIField<{
  [K in keyof F]: F[K] extends UIField<infer D> ? D : never;
}> {
  const fieldsArray = Object.entries(fields);

  return (props) => {
    return (
      <div className="ui-object">
        {fieldsArray.map(([name, Ui]) => (
          <div className="ui-field" key={name}>
            <label>{name}</label>
            <Ui
              value={props.value[name]}
              setValue={(v) =>
                props.setValue((oldValue) => ({
                  ...oldValue,
                  [name]: v(oldValue[name]),
                }))
              }
            ></Ui>
          </div>
        ))}
      </div>
    );
  };
}

export function arrayUI<T>(
  Element: UIField<T>,
  key?: (t: T, i: number, arr: T[]) => string,
): UIField<T[]> {
  return (props) => {
    return (
      <ul className="ui-array">
        {props.value.map((t, i, a) => (
          <li key={key(t, i, a)}>
            {
              <Element
                value={t}
                setValue={(v) =>
                  props.setValue((oldValue) =>
                    oldValue.map((x, j) => (i === j ? v(x) : x)),
                  )
                }
              ></Element>
            }
          </li>
        ))}
      </ul>
    );
  };
}

export function tupleUI<Fs extends UIField<any>[]>(
  ...fields: Fs
): UIField<{
  [N in keyof Fs]: UIData<Fs[N]>;
}> {
  return (props) => {
    return (
      <ul>
        {fields.map((F, i) => (
          <li key={i}>
            {
              <F
                value={props.value[i]}
                setValue={(v2) =>
                  // @ts-expect-error
                  props.setValue(props.value.map((v, j) => (j === i ? v2 : v)))
                }
              ></F>
            }
          </li>
        ))}
      </ul>
    );
  };
}

export type Variant<T> = {
  name?: string;
  ui: UIField<T>;
  default: T;
};

export type VariantData<V extends Record<string, Variant<any>>> = {
  [K in keyof V]: {
    type: K;
    data: Parameters<V[K]["ui"]>[0]["value"];
    variants: {
      [K in keyof V]?: Parameters<V[K]["ui"]>[0]["value"];
    };
  };
}[keyof V];

export function variantUI<V extends Record<string, Variant<any>>>(
  variants: V,
): UIField<VariantData<V>> {
  const variantsArray = Object.entries(variants);

  return (props) => {
    const X = variants[props.value.type].ui;
    return (
      <div className="ui-variant">
        <ul>
          {variantsArray.map(([k, v]) => {
            return (
              <li
                onClick={() => {
                  props.setValue((oldValue) => ({
                    type: k,
                    data: props.value.variants[k] ?? v.default,
                    variants: props.value.variants,
                  }));
                }}
              >
                {v.name ?? k}
              </li>
            );
          })}
        </ul>
        <X
          value={props.value.data}
          setValue={(v) =>
            props.setValue((oldValue) => {
              const newValue = v(oldValue.data);

              return {
                type: props.value.type,
                data: newValue,
                variants: {
                  ...props.value.variants,
                  [props.value.type]: newValue,
                },
              };
            })
          }
        ></X>
      </div>
    );
  };
}

type ReactKey = string | number;

function withInsertedBefore<T>(
  array: T[],
  item: T,
  key: ReactKey,
  getkey: (t: T, i: number, arr: T[]) => ReactKey,
): T[] {
  return array.flatMap((t, i, a) =>
    getkey(t, i, a) === key ? [item, t] : [t],
  );
}

function without<T>(array: T[], index: number) {
  return array.slice(0, index).concat(array.slice(index + 1));
}

function insertAtIndex<T>(array: T[], item: T, index: number) {
  return array.slice(0, index).concat([item]).concat(array.slice(index));
}

function removeByKey<T>(
  array: T[],
  key: ReactKey,
  getkey: (t: T, i: number, a: T[]) => ReactKey,
): T[] {
  return array.filter((t, i, a) => getkey(t, i, a) !== key);
}

export function draggableArrayUI<T>(args: {
  Element: UIField<T>;
  DragDst: React.FC<{ value?: T }>;
  DragSrc: React.FC<{ value: T }>;
  key: (t: T, i: number, arr: T[]) => ReactKey;
  context: DragAndDrop<T>;
}): UIField<T[]> {
  const { Element, key, context, DragDst, DragSrc } = args;

  function Item(props: { t; i; a; setValue }) {
    const { t, i, a } = props;

    const [isBeingDragged, setIsBeingDragged] = useState(false);

    return (
      <li className={isBeingDragged ? "ui-is-being-dragged" : ""}>
        <context.DragDestination
          onSetValue={(newItem) => {
            // drag item here
            props.setValue((oldValue) => {
              // if we cant find the destination item to place this item before,
              // then we know it was deleted from this array, so we just put
              // it back.
              if (oldValue.map(key).indexOf(key(t, i, a)) === -1) {
                return insertAtIndex(oldValue, newItem, i);
              }

              // normal case (insert item before another by index)
              return withInsertedBefore(oldValue, newItem, key(t, i, a), key);
            });
          }}
        >
          <DragDst value={t}></DragDst>
        </context.DragDestination>
        <context.DragSource
          value={t}
          onReachDestination={() => {
            // if the drag operation has reached the destination, remove the old value
            props.setValue((oldValue) =>
              removeByKey(oldValue, key(t, i, a), key),
            );
          }}
          onStartDrag={() => {
            setIsBeingDragged(true);
          }}
          onEndDrag={() => {
            setIsBeingDragged(false);
            console.log("this is run");
          }}
        >
          <DragSrc value={t}></DragSrc>
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <Element
              value={t}
              setValue={(v) =>
                props.setValue((oldValue) =>
                  oldValue.map((x, j) => (i === j ? v(x) : x)),
                )
              }
            ></Element>
          </div>
        </context.DragSource>
      </li>
    );
  }

  return (props) => {
    return (
      <ul className="ui-array ui-array-draggable">
        {props.value.map((t, i, a) => (
          <Item
            key={key(t, i, a)}
            {...{ t, i, a, setValue: props.setValue }}
          ></Item>
        ))}
        <li>
          <context.DragDestination
            onSetValue={(newItem) => {
              props.setValue((oldValue) => [...oldValue, newItem]);
            }}
          >
            <DragDst value={undefined}></DragDst>
          </context.DragDestination>
        </li>
      </ul>
    );
  };
}
