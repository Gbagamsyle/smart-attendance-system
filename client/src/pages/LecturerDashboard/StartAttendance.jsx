import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FaPlay, FaCopy, FaRedo, FaList, FaStop } from "react-icons/fa";

export default function StartAttendance() {
  const { courseId } = useParams();
  const [code, setCode] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // if this page is accessed without a courseId, redirect back
  useEffect(() => {
    if (!courseId) {
      navigate("/lecturer");
    }
  }, [courseId, navigate]);

  // Check for existing active session when component mounts and auto-expire old ones
  useEffect(() => {
    const checkExistingSession = async () => {
      if (!courseId) return;

      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("id, attendance_code, start_time")
        .eq("course_id", courseId)
        .is("end_time", null)
        .order("start_time", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const session = data[0];
        const started = new Date(session.start_time);
        const now = new Date();
        const diffMinutes = (now - started) / 60000;
        if (diffMinutes >= 40) {
          // auto end expired session
          await supabase
            .from("attendance_sessions")
            .update({ end_time: now.toISOString() })
            .eq("id", session.id);
          // leave state cleared
        } else {
          setCode(session.attendance_code);
          setSessionId(session.id);
        }
      }
    };

    checkExistingSession();
  }, [courseId]);

  const generateCode = (existing = "") => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code;
    do {
      code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    } while (code === existing);
    return code;
  };

  const startSession = async () => {
    setLoading(true);
    setError("");

    // reset local state so UI shows the generator before we insert
    setCode("");
    setSessionId(null);

    // Close any currently active sessions so old codes are invalidated.
    await supabase
      .from("attendance_sessions")
      .update({ end_time: new Date().toISOString() })
      .eq("course_id", courseId)
      .is("end_time", null);

    // Create a new session and code
    const attendanceCode = generateCode();

    const { data, error } = await supabase
      .from("attendance_sessions")
      .insert([
        {
          course_id: courseId,
          attendance_code: attendanceCode,
        },
      ])
      .select();

    if (error) {
      setError(error.message);
    } else {
      setCode(attendanceCode);
      setSessionId(data[0].id);
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // Optionally, show a success message
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback: alert or something
      alert("Copy failed. Please copy manually: " + code);
    }
  };

  const reset = async () => {
    // Always end the current session (if any) and then create a brand new one.
    // This ensures old codes stop working immediately.
    if (sessionId) {
      const { error: endError } = await supabase
        .from("attendance_sessions")
        .update({ end_time: new Date().toISOString() })
        .eq("id", sessionId);

      if (endError) {
        setError("Failed to close previous session: " + endError.message);
        return;
      }
    }

    const newCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    const { data, error } = await supabase
      .from("attendance_sessions")
      .insert([
        {
          course_id: courseId,
          attendance_code: newCode,
        },
      ])
      .select();

    if (error) {
      setError("Failed to generate new code: " + error.message);
      return;
    }

    setCode(newCode);
    setSessionId(data[0].id);
    setError("");
  };

  const endSession = async () => {
    if (!sessionId) {
      setError("No session to end.");
      return;
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("attendance_sessions")
      .update({ end_time: now })
      .eq("id", sessionId);

    if (error) {
      setError("Failed to end session: " + error.message);
      return;
    }

    // Verification
    const { data: closedSession, error: verifyError } = await supabase
      .from("attendance_sessions")
      .select("end_time")
      .eq("id", sessionId)
      .single();

    if (verifyError || !closedSession || !closedSession.end_time) {
      setError("Session did not close properly. Please try again.");
      return;
    }

    setCode("");
    setSessionId(null);
    navigate("/lecturer");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Start Attendance Session
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!code ? (
          <button
            onClick={startSession}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <FaPlay className="mr-2" />
                Generate Attendance Code
              </>
            )}
          </button>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Attendance Code Generated
            </h3>
            <div className="bg-gray-200 p-4 rounded-lg mb-4">
              <h1 className="text-3xl font-mono font-bold text-gray-800">{code}</h1>
            </div>
            <p className="text-gray-600 mb-4">
              Share this code with your students to mark attendance.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200"
              >
                <FaCopy className="mr-2" />
                Copy Code
              </button>
              <button
                onClick={reset}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200"
              >
                <FaRedo className="mr-2" />
                New Code
              </button>
            </div>
            {sessionId && (
              <Link
                to={`/attendance-log/${sessionId}`}
                className="mt-4 w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200"
              >
                <FaList className="mr-2" />
                View Attendance Log
              </Link>
            )}
            {sessionId && (
              <button
                onClick={endSession}
                className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200"
              >
                <FaStop className="mr-2" />
                End Session
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}