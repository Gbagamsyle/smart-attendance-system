import { useState } from "react"
import { supabase } from "../services/supabase"
import { useNavigate } from "react-router-dom"

export default function Signup(){
  const navigate = useNavigate()
  
  const [role, setRole] = useState("student")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [department, setDepartment] = useState("")
  const [matricNumber, setMatricNumber] = useState("")
  const [level, setLevel] = useState("")
  const [acceptPolicy, setAcceptPolicy] = useState(false)
  const [loading, setLoading] = useState(false)

  const signup = async () => {
    if (!acceptPolicy) {
      alert("Please accept the Privacy Policy")
      return
    }

    if (!firstName || !lastName || !email || !password || !department) {
      alert("Please fill in all required fields")
      return
    }

    if (role === "student" && (!matricNumber || !level)) {
      alert("Please fill in all student required fields")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if(error){
        alert(error.message)
        setLoading(false)
        return
      }

      const user = data.user

      await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          role,
          department,
          matric_no: role === "student" ? matricNumber : null,
          level: role === "student" ? level : null
        })
        .eq("id", user.id)

      alert("Account created successfully!")
      navigate("/login")
    } catch (error) {
      alert("An error occurred: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
        
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Create an Account</h1>

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
          
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
          />

          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
          />

          {/* Student-only fields */}
          {role === "student" && (
            <>
              <input
                type="text"
                placeholder="Matric Number"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
              />

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
              >
                <option value="">Select Level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </select>
            </>
          )}

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
          >
            <option value="">Select Department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Medicine">Medicine</option>
            <option value="Telecommunication Engineering">Telecommunication Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Cyber Security">Cyber Security</option>
            <option value="Business">Business</option>
            <option value="Architecture">Architecture</option>
          </select>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
          />

          {/* Privacy Policy */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="policy"
              checked={acceptPolicy}
              onChange={(e) => setAcceptPolicy(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="policy" className="text-sm text-gray-700">
              I accept the <span className="font-semibold">Privacy Policy</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={signup}
          disabled={loading}
          className="w-full mt-6 py-2 bg-black text-white font-semibold rounded hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create an Account"}
        </button>

        {/* Login Link */}
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer font-semibold hover:underline"
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  )
}