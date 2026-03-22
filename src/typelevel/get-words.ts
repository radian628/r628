type HasTurd<T> = T extends `${infer Start}turd${infer End}`
  ? [Start, End]
  : never;

type DSFFDS = HasTurd<"saturday">;

// type Identifier = IdentifierChar | `${IdentifierChar}${Identifier}`;

// type GetWords<S extends string>
