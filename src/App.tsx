import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import Home from "./pages/home";
import TeacherView from "./pages/teacherView";
import Login from "./pages/login";
import { ErrorBoundary } from "react-error-boundary";
import MyCollections from "./pages/myCollections";
import MySimulations from "./pages/mySimulations";
import StudentView from "./pages/studentView";
import VtiStudentView from "./pages/vtiStudentView";

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
          element: <StudentView />,
        },
        {
          path: "teacher/:teacherid",
          element: <MySimulations />,
        },
        {
          path: "teacher/:teacherid/collections",
          element: <MyCollections />,
        },
        {
          path: "view/:simid/:teacherid",
          element: <TeacherView />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "viewvti/:simid",
          element: <VtiStudentView />
        }
      ]
    }
  ])

  return (
    <RouterProvider router={appRoutes} />
  );
}

export default App;
