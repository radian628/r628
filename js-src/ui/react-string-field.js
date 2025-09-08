// src/ui/react-string-field.tsx
function StringField(props) {
  return /* @__PURE__ */ React.createElement(
    "input",
    {
      value: props.value,
      onInput: (e) => {
        props.setValue(e.currentTarget.value);
      }
    }
  );
}
export {
  StringField
};
