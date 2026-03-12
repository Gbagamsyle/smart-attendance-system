import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaBook, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaArrowRight } from 'react-icons/fa';
import { GiTeacher } from 'react-icons/gi';
import MyCourses from './LecturerDashboard/MyCourses';

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(null);

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
      onClick: () => {},
      stats: 'Detailed analytics'
    },
    {
      id: 4,
      title: 'Reports',
      description: 'Generate and view attendance reports',
      icon: FaChartBar,
      onClick: () => {},
      stats: 'Export & download'
    },
    {
      id: 5,
      title: 'Settings',
      description: 'Configure your account and preferences',
      icon: FaCog,
      onClick: () => {},
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
                    <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
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
                    <p className="text-3xl font-bold text-gray-900 mt-2">240</p>
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
                    <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaClipboardList className="text-blue-600 text-2xl" />
                  </div>
                </div>
              </div>
            </div>

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
