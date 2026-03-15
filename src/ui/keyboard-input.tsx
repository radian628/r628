export function keyboardInput() {
  let keysDown = new Set<string>();

  document.addEventListener("keydown", (e) => {
    keysDown.add(e.key.toLowerCase());
  });
  document.addEventListener("keyup", (e) => {
    keysDown.delete(e.key.toLowerCase());
  });
  return { keysDown };
}
