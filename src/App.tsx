import { BrowserRouter, Routes, Route, RouteProps, createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import BaseView from "./pages/baseView";
import Home from "./pages/home";
import TeacherHome from "./pages/teacherHome";
import TeacherView from "./pages/teacherView";
import AddFilePage from "./pages/addFilePage";
import { useState } from "react";
import Login from "./pages/login";
import { ErrorBoundary } from "react-error-boundary";
import MyCollections from "./pages/myCollections";
import AddCollection from "./pages/addCollection";

const Fallback = ({error} : {error:any}) => {
  return (
    <div>Error 500: something went wrong</div>
  )
}
function App() {
  
  const ErrorBoundaryLayout = () => (
    <ErrorBoundary FallbackComponent={Fallback}>
      <Outlet />
    </ErrorBoundary>
  );

  const appRoutes = createBrowserRouter([
    {
      element: <ErrorBoundaryLayout />,
      children: [
        {
          path: "/",
          element: <Home />
        },
        {
          path: "view/:simid",
          element: <BaseView />,
        },
        {
          path: "teacher/:teacherid",
          element: <TeacherHome />,
        },
        {
          path: "teacher/:teacherid/addfile",
          element: <AddFilePage />,
        },
        {
          path: "teacher/:teacherid/collections",
          element: <MyCollections />,
        },
        {
          path: "teacher/:teacherid/addcollection",
          element: <AddCollection />,
        },
        {
          path: "view/:simid/:teacherid",
          element: <TeacherView />,
        },
        {
          path: "login",
          element: <Login />,
        },
      ]
    }
  ])

  return (
    <RouterProvider router={appRoutes} />
  );
}

export default App;
