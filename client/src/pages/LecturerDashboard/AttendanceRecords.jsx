import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FaChartBar, FaCalendarAlt, FaUsers, FaSearch, FaClock } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

export default function AttendanceRecords() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      setLoading(true);

      const { data: courses } = await supabase
        .from("courses")
        .select("id")
        .eq("lecturer_id", user.id);

      if (!courses || courses.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      const courseIds = courses.map((c) => c.id);

      const { data: sessionsData } = await supabase
        .from("attendance_sessions")
        .select(`
          id,
          attendance_code,
          start_time,
          end_time,
          course_id,
          courses (course_name, course_code)
        `)
        .in("course_id", courseIds)
        .order("start_time", { ascending: false });

      const processedSessions =
        sessionsData?.map((session) => ({
          id: session.id,
          code: session.attendance_code,
          course_name: session.courses?.course_name || "Unknown Course",
          course_code: session.courses?.course_code || "UNKNOWN",
          date: session.start_time,
          status: session.end_time ? "Ended" : "Active",
        })) || [];

      setSessions(processedSessions);
      setLoading(false);
    };

    fetchSessions();
  }, [user]);

  const filteredSessions = sessions.filter((session) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      session.course_name.toLowerCase().includes(query) ||
      session.course_code.toLowerCase().includes(query) ||
      session.code.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: sessions.length,
    active: sessions.filter((session) => session.status === "Active").length,
    ended: sessions.filter((session) => session.status === "Ended").length,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/lecturer" className="mr-4 text-blue-500 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
          <FaChartBar className="text-blue-500 mr-3" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Sessions</h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by course or session code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'ended'].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                    filter === item
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {item === 'all' ? 'All' : item === 'active' ? 'Active' : 'Ended'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center gap-3">
              <FaUsers className="text-blue-500 text-xl" />
              <div>
                <p className="text-xs text-gray-500">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center gap-3">
              <FaClock className="text-green-500 text-xl" />
              <div>
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-purple-500 text-xl" />
              <div>
                <p className="text-xs text-gray-500">Ended</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ended}</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FaChartBar className="text-gray-400 text-6xl mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No sessions found</p>
            <p className="text-gray-500">Try adjusting your filter or search query</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(`/attendance-session/${session.id}`)}
                className="bg-white p-4 rounded-lg shadow hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">
                    {session.course_code} - {session.course_name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      session.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600">Code: {session.code}</p>
                <p className="text-sm text-gray-500">
                  {new Date(session.date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
