import React, { Dispatch, JSX, SetStateAction, useState } from "react";
import { StringField } from "./react-string-field";
import { NumberField } from "./react-number-field";

export type ObjectFieldComponent<T, AdditionalProps> = (
  props: {
    value: T;
    setValue: (t: T) => void;
  } & AdditionalProps
) => JSX.Element;

export type ObjectFieldComponents = Record<
  string | number | symbol,
  ObjectFieldComponent<any, any>
>;

export type ObjectFieldLayoutEntry<
  S extends ObjectFieldComponents,
  Key extends keyof S,
> =
  S[Key] extends ObjectFieldComponent<infer Type, infer AdditionalProps>
    ? {
        ui: Key;
        props: Omit<AdditionalProps, "value" | "setValue">;
        value: Type;
        label?: string;
        description?: string;
      }
    : never;

export type ObjectFieldLayout<S extends ObjectFieldComponents> = Record<
  string,
  { [Key in keyof S]: ObjectFieldLayoutEntry<S, Key> }[keyof S]
>;

export type ToNativeObject<T extends ObjectFieldLayout<any>> = {
  [K in keyof T]: T[K]["value"];
};

export function objectFieldDataToNativeObject<T extends ObjectFieldLayout<any>>(
  t: T
): ToNativeObject<T> {
  // @ts-expect-error
  return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.value]));
}

export function ObjectField<
  S extends ObjectFieldComponents,
  L extends ObjectFieldLayout<S>,
>(props: { components: S; value: L; setValue: (v: L) => void }) {
  return (
    <ul>
      {Object.entries(props.value).map(([k, v]) => {
        const Comp: any = props.components[v.ui];
        return (
          <li key={k}>
            {v.label ? <label>{v.label}</label> : <></>}
            <Comp
              value={v.value}
              // @ts-expect-error
              setValue={(val) => {
                props.setValue({
                  ...props.value,
                  [k]: {
                    ...props.value[k],
                    value: val,
                  },
                });
              }}
              {...v.props}
            ></Comp>
            {v.description ? <div>{v.description}</div> : <></>}
          </li>
        );
      })}
    </ul>
  );
}

export function useObjectFieldLayout<C extends ObjectFieldComponents>() {
  return function <T extends ObjectFieldLayout<C>>(
    t: T
  ): [T, Dispatch<SetStateAction<T>>] {
    return useState(t);
  };
}
