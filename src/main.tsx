import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Preload critical images immediately
import "@/lib/imagePreloader";

createRoot(document.getElementById("root")!).render(<App />);
