import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FaChartBar, FaCalendarAlt, FaUsers, FaClock, FaSearch } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

export default function AttendanceRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;

      setLoading(true);

      // Get lecturer's courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, course_name, course_code')
        .eq('lecturer_id', user.id);

      if (!courses || courses.length === 0) {
        setLoading(false);
        return;
      }

      const courseIds = courses.map(c => c.id);

      // Get all sessions for these courses
      const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select('*')
        .in('course_id', courseIds)
        .order('start_time', { ascending: false });

      if (!sessions) {
        setLoading(false);
        return;
      }

      // Get attendance records with student info
      const sessionIds = sessions.map(s => s.id);
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select(`
          *,
          attendance_sessions (
            id,
            attendance_code,
            start_time,
            end_time,
            courses (course_name, course_code)
          ),
          students:student_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .in('session_id', sessionIds)
        .order('marked_at', { ascending: false });

      // Process data
      const processedRecords = attendanceData?.map(record => ({
        ...record,
        student_name: record.students?.raw_user_meta_data?.name || record.students?.email || 'Unknown',
        course_name: record.attendance_sessions?.courses?.course_name || 'Unknown Course',
        course_code: record.attendance_sessions?.courses?.course_code || '',
        session_code: record.attendance_sessions?.attendance_code || '',
        session_date: record.attendance_sessions?.start_time,
        session_end: record.attendance_sessions?.end_time,
        ip_address: record.ip_address
      })) || [];

      setRecords(processedRecords);
      setLoading(false);
    };

    fetchRecords();
  }, [user]);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.session_code.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'today') {
      const today = new Date().toDateString();
      return matchesSearch && new Date(record.marked_at).toDateString() === today;
    }
    if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && new Date(record.marked_at) >= weekAgo;
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            to="/lecturer"
            className="mr-4 text-blue-500 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>
          <FaChartBar className="text-blue-500 mr-3" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">
            Attendance Records
          </h2>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, course, or session code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  filter === 'today'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter('week')}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  filter === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                This Week
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaUsers className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-gray-600 text-sm">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{records.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaCalendarAlt className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-gray-600 text-sm">Unique Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(records.map(r => r.student_id)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaClock className="text-purple-500 text-2xl mr-3" />
              <div>
                <p className="text-gray-600 text-sm">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(records.map(r => r.session_id)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaChartBar className="text-orange-500 text-2xl mr-3" />
              <div>
                <p className="text-gray-600 text-sm">Avg per Session</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.length > 0
                    ? Math.round(records.length / new Set(records.map(r => r.session_id)).size)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Records Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FaChartBar className="text-gray-400 text-6xl mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No attendance records found</p>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marked At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.student_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {record.student_id?.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.course_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.course_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.session_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(record.session_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.marked_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {record.ip_address || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}