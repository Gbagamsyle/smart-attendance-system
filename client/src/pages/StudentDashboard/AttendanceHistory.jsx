import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FaHistory, FaCalendarAlt, FaBook } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("attendance_records")
        .select(`
          *,
          attendance_sessions (
            id,
            courses (name)
          )
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setRecords(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center mb-6">
          <Link
            to="/student"
            className="mr-4 text-blue-500 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>
          <FaHistory className="text-blue-500 mr-3" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">
            My Attendance History
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
            <p className="mt-4 text-gray-600">Loading your attendance history...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="text-gray-400 text-6xl mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No attendance records found.</p>
            <p className="text-gray-500">Start marking attendance to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700 mb-4">
              You have marked attendance {records.length} time{records.length !== 1 ? "s" : ""}.
            </p>
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-gray-50 p-4 rounded-lg border flex items-center justify-between"
              >
                <div className="flex items-center">
                  <FaCalendarAlt className="text-green-500 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {record.attendance_sessions?.courses?.name || "Unknown Course"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Marked on {new Date(record.created_at).toLocaleDateString()} at{" "}
                      {new Date(record.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Present
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}