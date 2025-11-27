import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress errors from browser extensions and external scripts
const suppressedPatterns = [
  'User rejected',
  'chrome-extension',
  'metamask',
  'wallet',
  'ethereum',
  'web3',
  'User denied',
  'Request rejected',
  'acmacodkjbdgmoleebolmdjonilkdbch',
  'content-script'
];

const shouldSuppress = (error: unknown): boolean => {
  const errorStr = String(error);
  const stack = error instanceof Error ? error.stack || '' : '';
  return suppressedPatterns.some(pattern => 
    errorStr.toLowerCase().includes(pattern.toLowerCase()) ||
    stack.toLowerCase().includes(pattern.toLowerCase())
  );
};

window.addEventListener('unhandledrejection', (event) => {
  if (shouldSuppress(event.reason)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }
  event.preventDefault();
}, true);

window.addEventListener('error', (event) => {
  if (shouldSuppress(event.error) || shouldSuppress(event.message)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }
}, true);

// Override console.error to filter extension errors
const originalError = console.error;
console.error = (...args) => {
  const message = args.map(a => String(a)).join(' ');
  if (!shouldSuppress(message)) {
    originalError.apply(console, args);
  }
};

createRoot(document.getElementById("root")!).render(<App />);
