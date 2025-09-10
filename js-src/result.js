// src/result.ts
function ok(t) {
  return {
    ok: true,
    data: t
  };
}
function err(e) {
  return {
    ok: false,
    error: e
  };
}
export {
  err,
  ok
};
