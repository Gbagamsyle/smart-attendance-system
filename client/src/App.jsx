import { BrowserRouter, Routes, Route } from "react-router-dom"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import StudentDashboard from "./pages/StudentDashboard"
import LecturerDashboard from "./pages/LecturerDashboard"
import Signup from "./pages/Signup"
import CreateCourse from "./pages/LecturerDashboard/CreateCourse"
import MyCourses from "./pages/LecturerDashboard/MyCourses"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

        <Route
          path="/lecturer"
          element={<LecturerDashboard />}
        />
        <Route
          path="/create-course"
          element={<CreateCourse />}
        />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route
          path="/signup"
          element={<Signup />}
        />  
      </Routes>

    </BrowserRouter>

  )
}

export default App