import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { AuthProvider } from "./contexts/auth";
import "./global.css";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense>
          <FileRoutes />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
