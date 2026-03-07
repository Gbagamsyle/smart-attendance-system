import { BrowserRouter, Routes, Route } from "react-router-dom"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import StudentDashboard from "./pages/StudentDashboard"
import LecturerDashboard from "./pages/LecturerDashboard"
import Signup from "./pages/Signup"

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
          path="/signup"
          element={<Signup />}
        />  
      </Routes>

    </BrowserRouter>

  )
}

export default App