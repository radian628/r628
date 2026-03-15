// src/ui/keyboard-input.tsx
function keyboardInput() {
  let keysDown = /* @__PURE__ */ new Set();
  document.addEventListener("keydown", (e) => {
    keysDown.add(e.key.toLowerCase());
  });
  document.addEventListener("keyup", (e) => {
    keysDown.delete(e.key.toLowerCase());
  });
  return { keysDown };
}
export {
  keyboardInput
};
