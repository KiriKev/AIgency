import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof Error) {
    console.warn('Unhandled promise rejection:', event.reason.message);
  } else {
    console.warn('Unhandled promise rejection:', event.reason);
  }
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
