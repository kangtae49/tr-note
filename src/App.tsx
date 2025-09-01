import "./App.css";
import { Toaster } from 'react-hot-toast'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AppLayout from "@/routes/AppLayout.tsx";
import ErrorView from "@/routes/ErrorView.tsx";
import MainView from "@/routes/MainView.tsx";
import {shellOpenUrl} from "@/components/utils.ts";



export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorView />,
    children: [
      {
        index: true,
        element: <MainView />,
      },
      {
        path: '/note',
        element: <MainView />,
      },
    ]
  },
]);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", async (e) => {
    const target = (e.target as Element).closest("a");
    if (target) {
      target.setAttribute("target", "_blank");
    }
  });
});

function App() {


  return (
    <main className="container">
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </main>
  );
}

export default App;
