import { useState } from "react"
import { supabase } from "../services/supabase"
import { useNavigate } from "react-router-dom"

export default function Login(){

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

        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("matric_no", emailInput)
          .single()

        if(!data){
          alert("Matric number not found")
          setLoading(false)
          return
        }

        // get the auth email
        const { data: userData } = await supabase.auth.admin.getUserById(data.id)

        loginEmail = userData.user.email
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
        
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Log In</h1>

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
  )
}