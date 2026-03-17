import { useState } from "react"
import { supabase } from "../services/supabase"
import { useNavigate } from "react-router-dom"

export default function Landing(){

  const [role, setRole] = useState("student")
  const [emailInput, setEmailInput] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const login = async () => {

    if (!emailInput || !password) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      let loginEmail = emailInput

      // check if user typed matric number (for students)
      if(role === "student" && !emailInput.includes("@")){

        const { data, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("matric_no", emailInput)
          .single()

        if(error || !data || !data.email){
          alert("Matric number not found or account needs to be updated. Please contact administrator or try logging in with your email address.")
          setLoading(false)
          return
        }

        loginEmail = data.email
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      })

      if(error){
        alert(error.message)
        setLoading(false)
        return
      }

      const user = data.user

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if(profile.role === "student"){
        navigate("/student")
      }else if(profile.role === "lecturer"){
        navigate("/lecturer")
      }
    } catch (error) {
      alert("An error occurred: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return(
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Smart Attendance System</h1>
          <p className="text-xl text-gray-300 mb-4">
            Streamlined attendance tracking for students and lecturers
          </p>
          <p className="text-lg text-gray-400">
            Efficient, secure, and easy-to-use attendance management
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
            <p className="text-gray-600">
              Track attendance in real-time with accurate timestamps
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Analytics & Reports</h3>
            <p className="text-gray-600">
              Generate detailed attendance reports and analytics
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">
              Enterprise-grade security for your data
            </p>
          </div>

        </div>
      </div>

      {/* Login Section */}
      <div className="bg-gray-100 py-16 px-4">
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
            
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Log In</h2>

            {/* Role Selection */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setRole("student")}
                className={`flex-1 py-2 px-4 rounded font-medium transition ${
                  role === "student"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🎓 Student
              </button>
              <button
                onClick={() => setRole("lecturer")}
                className={`flex-1 py-2 px-4 rounded font-medium transition ${
                  role === "lecturer"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🧑‍🏫 Lecturer
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              
              {role === "student" ? (
                <input
                  type="text"
                  placeholder="Email or Matric Number"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                />
              ) : (
                <input
                  type="email"
                  placeholder="Email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                />
              )}

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={login}
              disabled={loading}
              className="w-full mt-6 py-2 bg-black text-white font-semibold rounded hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            {/* Signup Link */}
            <p className="text-center mt-4 text-sm text-gray-600">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-blue-600 cursor-pointer font-semibold hover:underline"
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2026 Smart Attendance System. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
