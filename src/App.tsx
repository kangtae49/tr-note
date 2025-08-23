import "./App.css";
import { Toaster } from 'react-hot-toast'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AppLayout from "@/routes/AppLayout.tsx";
import ErrorView from "@/routes/ErrorView.tsx";
import MainView from "@/routes/MainView.tsx";

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
function App() {

  return (
    <main className="container">
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </main>
  );
}

export default App;
