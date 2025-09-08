export function StringField(props: {
  value: string;
  setValue: (s: string) => void;
}) {
  return (
    <input
      value={props.value}
      onInput={(e) => {
        props.setValue(e.currentTarget.value);
      }}
    ></input>
  );
}
