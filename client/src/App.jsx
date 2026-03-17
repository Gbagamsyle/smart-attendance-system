import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import StudentDashboard from "./pages/StudentDashboard"
import LecturerDashboard from "./pages/LecturerDashboard"
import Signup from "./pages/Signup"
import CreateCourse from "./pages/LecturerDashboard/CreateCourse"
import MyCourses from "./pages/LecturerDashboard/MyCourses"
import StartAttendance from "./pages/LecturerDashboard/StartAttendance"
import AttendanceLog from "./pages/LecturerDashboard/AttendanceLog"
import JoinAttendance from "./pages/StudentDashboard/JoinAttendance"
import AttendanceHistory from "./pages/StudentDashboard/AttendanceHistory"
import StudentProfile from "./pages/StudentDashboard/StudentProfile"
import StudentSettings from "./pages/StudentDashboard/StudentSettings"
import AttendanceRecords from "./pages/LecturerDashboard/AttendanceRecords"
import Reports from "./pages/LecturerDashboard/Reports"
import LecturerSettings from "./pages/LecturerDashboard/LecturerSettings"

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
        <Route path="/join-attendance" element={<JoinAttendance />} />
        <Route path="/attendance-history" element={<AttendanceHistory />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student-settings" element={<StudentSettings />} />

        <Route
          path="/lecturer"
          element={<LecturerDashboard />}
        />
        <Route
          path="/create-course"
          element={<CreateCourse />}
        />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/start-attendance" element={<Navigate to="/lecturer" />} />
        <Route path="/start-attendance/:courseId" element={<StartAttendance />} />
        <Route path="/attendance-log/:sessionId" element={<AttendanceLog />} />
        <Route path="/lecturer-dashboard" element={<Navigate to="/lecturer" />} />
        <Route path="/attendance-records" element={<AttendanceRecords />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/lecturer-settings" element={<LecturerSettings />} />
        <Route
          path="/signup"
          element={<Signup />}
        />  
      </Routes>

    </BrowserRouter>

  )
}

export default App