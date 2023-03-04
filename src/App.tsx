import { BrowserRouter, Routes, Route } from "react-router-dom";
import BaseView from "./pages/baseView";
import Home from "./pages/home";
import TeacherHome from "./pages/teacherHome";
import TeacherView from "./pages/teacherView";
import AddFilePage from "./pages/addFilePage";
import { useState } from "react";
import Login from "./pages/login";

function App() {
  
  const [appSuccessNotification, setAppSuccessNotification] = useState<string | null>(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="view/:simid" element={<BaseView />} />
        <Route path="teacher/:teacherid" element={<TeacherHome />} />
        <Route path="teacher/:teacherid/addfile" element={<AddFilePage setSuccessNotification={setAppSuccessNotification} />} />
        <Route path="view/:simid/:teacherid" element={<TeacherView />} />
        <Route path="login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
