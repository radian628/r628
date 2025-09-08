import { createRoot } from "react-dom/client";

export function mount(E: React.FC) {
  const root = createRoot(document.getElementById("root")!).render(<E></E>);
}
