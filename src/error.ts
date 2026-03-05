export type Error<Ctx> = {
  ctx: Ctx;
  causes: Error<any>[];
  msg: string;
};

export function mergeErrors<Ctx>(ctx: Ctx, msg: string, ...errs: Error<Ctx>[]) {
  return {
    msg,
    causes: errs,
    ctx,
  };
}
