import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FaArrowLeft, FaUserCheck } from "react-icons/fa";

export default function AttendanceLog() {
  const { sessionId } = useParams();
  const [records, setRecords] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      // fetch session details to know the course id for back navigation
      const { data: sessionData, error: sessionError } = await supabase
        .from("attendance_sessions")
        .select("course_id")
        .eq("id", sessionId)
        .single();

      if (!sessionError && sessionData) {
        setCourseId(sessionData.course_id);
      }

      const { data, error } = await supabase
        .from("attendance_records")
        .select("*, profiles(name, matric_no)")
        .eq("session_id", sessionId);

      if (error) {
        setError(error.message);
      } else {
        setRecords(data);
      }
      setLoading(false);
    };

    if (sessionId) fetchAttendance();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center mb-6">
          <Link
            to={
              courseId
                ? `/start-attendance/${courseId}`
                : "/lecturer"
            }
            className="mr-4 text-blue-500 hover:text-blue-700"
          >
            <FaArrowLeft size={24} />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">
            Attendance Log
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attendance records...</p>
          </div>
        ) : records.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No students have marked attendance yet.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700 mb-4">
              {records.length} student{records.length !== 1 ? "s" : ""} have marked attendance.
            </p>
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-gray-50 p-4 rounded-lg border flex items-center"
              >
                <FaUserCheck className="text-green-500 mr-3" />
                <div>
                  <p className="font-semibold text-gray-800">
                {record.profiles?.name || "Unknown Student"}
                </p>

                <p className="text-gray-600 text-sm">
                {record.profiles?.matric_no || ""}
                </p>

                <p className="text-gray-500 text-xs">
                Marked at: {new Date(record.created_at).toLocaleString()}
                </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}