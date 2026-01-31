import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LoadingScreen } from "./components/loading";

function Root() {
  const [loading, setLoading] = useState(true);
  const handleFinished = useCallback(() => setLoading(false), []);

  return loading ? <LoadingScreen onFinished={handleFinished} /> : <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
