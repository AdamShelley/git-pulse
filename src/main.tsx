import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import IssuePage from "./pages/issues/issue-page";
import Root from "./root";
import Settings from "./pages/settings/settings";
import SelectRepos from "./pages/dashboard/components/select-repos";
import CommentPage from "./pages/comments/comment-page";
import { AnimatePresence } from "framer-motion";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [],
      },

      {
        path: "/select-repos",
        element: <SelectRepos />,
      },

      {
        path: "/issues/:id",
        element: <IssuePage />,
      },
      {
        path: "/issues/:id/comment/:commentId",
        element: <CommentPage />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AnimatePresence mode="wait">
      <RouterProvider router={router} />
    </AnimatePresence>
  </React.StrictMode>
);
