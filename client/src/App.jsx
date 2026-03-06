import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import StudentDashboard from "./pages/StudentDashboard"
import LecturerDashboard from "./pages/LecturerDashboard"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

        <Route
          path="/lecturer"
          element={<LecturerDashboard />}
        />

      </Routes>

    </BrowserRouter>

  )
}

export default App