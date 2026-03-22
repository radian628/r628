export async function namedPromiseAll<
  P extends Record<`${string}Promise`, Promise<any>>,
>(
  promises: P,
): Promise<{
  [K in keyof P as K extends `${infer V}Promise` ? V : never]: Awaited<P[K]>;
}> {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(promises).map(async ([k, v]) => [k.slice(0, -7), await v]),
    ),
  );
}
