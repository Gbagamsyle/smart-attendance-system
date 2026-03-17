import { Link } from "react-router-dom";
import { FaQrcode, FaHistory, FaUser, FaCog } from "react-icons/fa";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Student Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage your attendance and account settings
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Join Attendance */}
          <Link
            to="/join-attendance"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 block group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 group-hover:bg-blue-200 rounded-full p-4 mb-4 transition-colors duration-300">
                <FaQrcode className="text-blue-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Join Attendance
              </h3>
              <p className="text-gray-600 text-sm">
                Enter attendance code to mark your presence
              </p>
            </div>
          </Link>

          {/* My Attendance History */}
          <Link
            to="/attendance-history"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 block group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 group-hover:bg-green-200 rounded-full p-4 mb-4 transition-colors duration-300">
                <FaHistory className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Attendance History
              </h3>
              <p className="text-gray-600 text-sm">
                View your past attendance records
              </p>
            </div>
          </Link>

          {/* Profile */}
          <Link
            to="/student-profile"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 block group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 group-hover:bg-purple-200 rounded-full p-4 mb-4 transition-colors duration-300">
                <FaUser className="text-purple-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Profile
              </h3>
              <p className="text-gray-600 text-sm">
                Manage your personal information
              </p>
            </div>
          </Link>

          {/* Settings */}
          <Link
            to="/student-settings"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 block group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 group-hover:bg-gray-200 rounded-full p-4 mb-4 transition-colors duration-300">
                <FaCog className="text-gray-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Settings
              </h3>
              <p className="text-gray-600 text-sm">
                Configure your preferences
              </p>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Need help? Contact your lecturer or administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
