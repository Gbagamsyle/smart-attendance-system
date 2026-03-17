import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaBook, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaArrowRight, FaPlay, FaStop } from 'react-icons/fa';
import { GiTeacher } from 'react-icons/gi';
import { supabase } from '../services/supabase';
import useAuth from '../hooks/useAuth';
import MyCourses from './LecturerDashboard/MyCourses';

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCard, setActiveCard] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    sessionsToday: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      // Fetch active sessions
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('lecturer_id', user.id);

      if (!courses || courses.length === 0) return;

      const courseIds = courses.map(c => c.id);

      const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select(`
          id,
          attendance_code,
          start_time,
          course_id,
          courses (
            course_name,
            course_code
          )
        `)
        .is('end_time', null)
        .in('course_id', courseIds)
        .order('start_time', { ascending: false });

      if (sessions) {
        setActiveSessions(sessions);
      }

      // Fetch dashboard stats
      const stats = {
        totalCourses: courses.length,
        totalStudents: 0,
        sessionsToday: 0
      };

      // Get unique students who have attended any session
      const { data: allSessions } = await supabase
        .from('attendance_sessions')
        .select('id')
        .in('course_id', courseIds);

      if (allSessions && allSessions.length > 0) {
        const allSessionIds = allSessions.map(s => s.id);
        const { data: allRecords } = await supabase
          .from('attendance_records')
          .select('student_id')
          .in('session_id', allSessionIds);

        stats.totalStudents = new Set(allRecords?.map(r => r.student_id) || []).size;
      }

      // Get sessions created today
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const { count: todaySessions } = await supabase
        .from('attendance_sessions')
        .select('*', { count: 'exact', head: true })
        .in('course_id', courseIds)
        .gte('start_time', startOfDay.toISOString());

      stats.sessionsToday = todaySessions || 0;

      setDashboardStats(stats);
    };

    fetchDashboardData();
  }, [user]);

  const menuItems = [
    {
      id: 1,
      title: 'Create Courses',
      description: 'Set up new courses for your students',
      icon: FaBook,
      onClick: () => navigate('/create-course'),
      stats: 'Manage all courses'
    },
    {
      id: 2,
      title: 'My Courses',
      description: 'View your courses and start attendance sessions',
      icon: FaBook,
      onClick: () => navigate('/my-courses'),
      stats: 'Manage courses'
    },
    {
      id: 3,
      title: 'View Attendance Records',
      description: 'Check attendance history and records',
      icon: FaChartBar,
      onClick: () => navigate('/attendance-records'),
      stats: 'Detailed analytics'
    },
    {
      id: 4,
      title: 'Reports',
      description: 'Generate and view attendance reports',
      icon: FaChartBar,
      onClick: () => navigate('/reports'),
      stats: 'Export & download'
    },
    {
      id: 5,
      title: 'Settings',
      description: 'Configure your account and preferences',
      icon: FaCog,
      onClick: () => navigate('/lecturer-settings'),
      stats: 'Profile & security'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <GiTeacher className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lecturer Dashboard</h1>
                <p className="text-gray-600 text-sm mt-1">Welcome back! Manage your courses and attendance</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition duration-200">
              <FaSignOutAlt className="text-gray-600 text-xl hover:text-gray-900" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Courses</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalCourses}</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaBook className="text-blue-600 text-2xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalStudents}</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GiTeacher className="text-blue-600 text-2xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Sessions Today</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.sessionsToday}</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaClipboardList className="text-blue-600 text-2xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Attendance Sessions */}
            {activeSessions.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaPlay className="text-green-600" />
                  Active Attendance Sessions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-lg transition duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FaPlay className="text-green-600 text-lg" />
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          Active
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {session.courses?.course_name || 'Unknown Course'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Code: <span className="font-mono font-bold">{session.attendance_code}</span>
                      </p>
                      <p className="text-gray-500 text-xs mb-4">
                        Started: {new Date(session.start_time).toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/attendance-log/${session.id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center gap-1"
                        >
                          <FaClipboardList className="text-xs" />
                          View Log
                        </button>
                        <button
                          onClick={() => session.course_id && navigate(`/start-attendance/${session.course_id}`)}
                          disabled={!session.course_id}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center gap-1 disabled:cursor-not-allowed"
                        >
                          <FaStop className="text-xs" />
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Cards */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setActiveCard(item.id)}
                      onMouseLeave={() => setActiveCard(null)}
                      className="group"
                    >
                      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition duration-300 h-full flex flex-col justify-between cursor-pointer"
                        onClick={item.onClick}>
                        {/* Icon */}
                        <div className="mb-6">
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition duration-300">
                            <IconComponent className="text-blue-600 text-3xl group-hover:text-white transition duration-300" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                          <span className="text-gray-600 text-xs font-medium">{item.stats}</span>
                          <button
                            onClick={item.onClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 group-hover:translate-x-1"
                          >
                            Access <FaArrowRight className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

        {/* My Courses */}
        <div className="mb-12">
          <MyCourses />
        </div>

        {/* Footer Section */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 mt-12">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">© 2026 DPM School. All rights reserved.</p>
            <div className="flex gap-6">
              <button className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">Privacy Policy</button>
              <button className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 
}
