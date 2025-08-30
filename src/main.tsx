import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {HttpServerProvider} from "@/components/HttpServerProvider.tsx";
import * as Tooltip  from "@radix-ui/react-tooltip";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HttpServerProvider>
    <Tooltip.Provider>

      <App />

    </Tooltip.Provider>
    </HttpServerProvider>
  </React.StrictMode>,
);
