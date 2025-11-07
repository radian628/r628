// src/point-free.ts
function compose(...args) {
  return (x) => {
    for (const a of args) x = a(x);
    return x;
  };
}
export {
  compose
};
