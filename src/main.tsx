import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import IssuePage from "./issues/issue-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/issues/:id",
    element: <IssuePage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
