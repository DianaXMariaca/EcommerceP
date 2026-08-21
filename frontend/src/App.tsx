import { useEffect, useState } from "react";
import { apiFetch } from "./lib/api";

type BackendStatus = "loading" | "connected" | "error";

function App() {
  const [status, setStatus] = useState<BackendStatus>("loading");

  useEffect(() => {
    apiFetch("/health")
      .then(() => setStatus("connected"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-neutral">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          Ecommerce MVP
        </h1>
        <p className="text-text-primary">
          {status === "loading" && "Conectando con el backend..."}
          {status === "connected" && "Backend conectado ✅"}
          {status === "error" && "Backend no disponible ❌"}
        </p>
      </div>
    </div>
  );
}

export default App;
