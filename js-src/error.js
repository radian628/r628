// src/error.ts
function mergeErrors(ctx, msg, ...errs) {
  return {
    msg,
    causes: errs,
    ctx
  };
}
export {
  mergeErrors
};
