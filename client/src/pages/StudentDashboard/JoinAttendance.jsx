import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FaQrcode, FaCheck } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

export default function JoinAttendance() {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const markAttendance = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in first.");
      return;
    }

    setLoading(true);
    setError("");

    // Find the session by code
    const { data: session, error: sessionError } = await supabase
      .from("attendance_sessions")
      .select("id, course_id")
      .eq("attendance_code", code.toUpperCase())
      .is("end_time", null)
      .maybeSingle();

    if (sessionError || !session) {
      setError("Invalid attendance code. Please check and try again.");
      setLoading(false);
      return;
    }

    // Check if already marked
    const { data: existing } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("session_id", session.id)
      .eq("student_id", user.id)
      .single();

    if (existing) {
      setError("You have already marked attendance for this session.");
      setLoading(false);
      return;
    }

    // Insert record
    const ip = await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => data.ip);

    const { error: insertError } = await supabase
      .from("attendance_records")
      .insert([
        {
          session_id: session.id,
          student_id: user.id,
          ip_address: ip,
        },
      ]);

    if (insertError) {
      setError("Failed to mark attendance. Please try again.");
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/student"), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <FaCheck className="text-green-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Attendance Marked!
          </h2>
          <p className="text-gray-600">
            Your attendance has been successfully recorded.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <FaQrcode className="text-blue-500 text-4xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            Join Attendance
          </h2>
          <p className="text-gray-600 mt-2">
            Enter the attendance code provided by your lecturer
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={markAttendance}>
          <div className="mb-6">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Attendance Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono text-center text-2xl tracking-widest"
              placeholder="Enter code"
              maxLength={5}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <FaCheck className="mr-2" />
                Mark Attendance
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/student")}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}