import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FaFileAlt, FaDownload, FaCalendarAlt, FaUsers, FaClock, FaChartLine } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

export default function Reports() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [reportType, setReportType] = useState("attendance");
  const [dateRange, setDateRange] = useState("all");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('lecturer_id', user.id)
        .order('course_name');

      setCourses(data || []);
    };

    fetchCourses();
  }, [user]);

  const generateReport = async () => {
    if (!selectedCourse) return;

    setLoading(true);

    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        attendance_sessions!inner (
          id,
          attendance_code,
          start_time,
          end_time,
          course_id,
          lecturer_ip
        ),
        profiles (name, matric_no)
      `)
      .eq('attendance_sessions.course_id', selectedCourse);

    // Apply date filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error generating report:', error);
      setLoading(false);
      return;
    }

    // Process data based on report type
    let processedData;

    if (reportType === 'attendance') {
      // Group by session
      const sessionsMap = new Map();

      data.forEach(record => {
        const sessionId = record.session_id;
        if (!sessionsMap.has(sessionId)) {
          sessionsMap.set(sessionId, {
            session_code: record.attendance_sessions?.attendance_code,
            date: record.attendance_sessions?.start_time,
            lecturer_ip: record.attendance_sessions?.lecturer_ip || null,
            attendees: []
          });
        }
        sessionsMap.get(sessionId).attendees.push({
          name: record.profiles?.name || 'Unknown',
          email: record.profiles?.matric_no || 'N/A',
          marked_at: record.created_at,
          ip_address: record.ip_address,
          device_info: record.device_info || 'N/A'
        });
      });

      const sessionsWithFraud = Array.from(sessionsMap.values()).map((session) => {
        const ipCounts = session.attendees.reduce((acc, attendee) => {
          if (attendee.ip_address) {
            acc[attendee.ip_address] = (acc[attendee.ip_address] || 0) + 1;
          }
          return acc;
        }, {});

        const attendees = session.attendees.map((attendee) => {
          const noIp = !attendee.ip_address;
          const mismatchWithLecturer =
            session.lecturer_ip && attendee.ip_address && attendee.ip_address !== session.lecturer_ip;
          const sharedIp = attendee.ip_address && ipCounts[attendee.ip_address] > 1;

          return {
            ...attendee,
            isSuspicious: noIp || mismatchWithLecturer || sharedIp,
            suspiciousReason: noIp
              ? 'No IP captured'
              : mismatchWithLecturer
              ? 'IP differs from lecturer network'
              : sharedIp
              ? 'IP shared by multiple students in same session'
              : null,
          };
        });

        return {
          ...session,
          attendees,
          suspiciousCount: attendees.filter(a => a.isSuspicious).length,
        };
      });

      processedData = {
        type: 'attendance',
        course: courses.find(c => c.id === selectedCourse),
        sessions: sessionsWithFraud,
        total_sessions: sessionsWithFraud.length,
        total_attendance: data.length,
        unique_students: new Set(data.map(r => r.student_id)).size,
        total_suspicious: sessionsWithFraud.reduce((sum, s) => sum + s.suspiciousCount, 0)
      };
    } else if (reportType === 'student') {
      // Group by student
      const studentsMap = new Map();

      data.forEach(record => {
        const studentId = record.student_id;
        const studentName = record.profiles?.name || 'Unknown';

        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, {
            name: studentName,
            email: record.profiles?.matric_no || 'N/A',
            sessions: []
          });
        }
        studentsMap.get(studentId).sessions.push({
          code: record.attendance_sessions?.attendance_code,
          date: record.marked_at
        });
      });

      processedData = {
        type: 'student',
        course: courses.find(c => c.id === selectedCourse),
        students: Array.from(studentsMap.values()),
        total_students: studentsMap.size
      };
    }

    setReportData(processedData);
    setLoading(false);
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportData.type === 'attendance') {
      csvContent += "Session Code,Date,Student Name,Email,Marked At,IP Address\n";
      reportData.sessions.forEach(session => {
        session.attendees.forEach(attendee => {
          csvContent += `${session.session_code},${new Date(session.date).toLocaleDateString()},${attendee.name},${attendee.email},${new Date(attendee.marked_at).toLocaleString()},${attendee.ip_address}\n`;
        });
      });
    } else {
      csvContent += "Student Name,Email,Sessions Attended,Last Attendance\n";
      reportData.students.forEach(student => {
        const lastAttendance = student.sessions.length > 0
          ? new Date(Math.max(...student.sessions.map(s => new Date(s.date)))).toLocaleDateString()
          : 'N/A';
        csvContent += `${student.name},${student.email},${student.sessions.length},${lastAttendance}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportData.type}_report_${reportData.course?.course_code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            to="/lecturer"
            className="mr-4 text-blue-500 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>
          <FaFileAlt className="text-blue-500 mr-3" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">
            Reports & Analytics
          </h2>
        </div>

        {/* Report Generator */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="attendance">Session Attendance</option>
                <option value="student">Student Summary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={loading || !selectedCourse}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaChartLine />
                )}
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Report Display */}
        {reportData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {reportData.type === 'attendance' ? 'Attendance Report' : 'Student Summary Report'}
                </h3>
                <p className="text-gray-600">
                  Course: {reportData.course?.course_code} - {reportData.course?.course_name}
                </p>
              </div>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition duration-200 flex items-center gap-2"
              >
                <FaDownload />
                Export CSV
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <FaCalendarAlt className="text-blue-500 text-2xl mb-2" />
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.type === 'attendance' ? reportData.total_sessions : 'N/A'}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <FaUsers className="text-green-500 text-2xl mb-2" />
                <p className="text-sm text-gray-600">Total Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.type === 'attendance' ? reportData.total_attendance : reportData.total_students}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <FaUsers className="text-purple-500 text-2xl mb-2" />
                <p className="text-sm text-gray-600">Unique Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.type === 'attendance' ? reportData.unique_students : reportData.total_students}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <FaClock className="text-orange-500 text-2xl mb-2" />
                <p className="text-sm text-gray-600">Avg per Session</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.type === 'attendance' && reportData.total_sessions > 0
                    ? Math.round(reportData.total_attendance / reportData.total_sessions)
                    : 'N/A'}
                </p>
              </div>
              {reportData.type === 'attendance' && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <FaChartLine className="text-red-500 text-2xl mb-2" />
                  <p className="text-sm text-gray-600">Suspicious Flags</p>
                  <p className="text-2xl font-bold text-red-900">
                    {reportData.total_suspicious || 0}
                  </p>
                </div>
              )}
            </div>

            {/* Report Content */}
            {reportData.type === 'attendance' ? (
              <div className="space-y-4">
                {reportData.sessions.map((session, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Session: {session.session_code}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">
                      {session.attendees.length} student{session.attendees.length !== 1 ? 's' : ''} attended
                    </p>
                    <div className="space-y-2">
                      {session.attendees.map((attendee, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div>
                            <span className="font-medium text-gray-900">{attendee.name}</span>
                            <span className="text-gray-500 ml-2">({attendee.email})</span>                            {attendee.isSuspicious && (
                              <span className="text-red-500 ml-2 text-xs">
                                ⚠ {attendee.suspiciousReason}
                              </span>
                            )}                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(attendee.marked_at).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {reportData.students.map((student, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {student.name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {student.email}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">
                      Attended {student.sessions.length} session{student.sessions.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1">
                      {student.sessions.slice(0, 5).map((session, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          Session {session.code} - {new Date(session.date).toLocaleDateString()}
                        </div>
                      ))}
                      {student.sessions.length > 5 && (
                        <div className="text-sm text-gray-500">
                          ... and {student.sessions.length - 5} more sessions
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}