import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FaBook, FaUsers, FaClipboardList, FaTrash, FaEllipsisV, FaEdit } from "react-icons/fa";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("lecturer_id", user.id);

    setLoading(false);
    if (error) {
      console.log(error);
    } else {
      setCourses(data || []);
    }
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) {
        console.log(error);
      } else {
        setCourses(courses.filter(c => c.id !== courseId));
      }
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Courses</h2>
            <p className="text-gray-600 text-base mt-2">Manage and teach your courses</p>
          </div>
          {courses.length > 0 && (
            <button 
              onClick={() => navigate("/lecturer/create-course")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition duration-200 flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <span className="text-xl">+</span> Create New Course
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium text-lg">Loading your courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-20 text-center">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <FaBook className="text-blue-600 text-6xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No courses yet</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">You haven't created any courses. Start by creating your first course to begin teaching.</p>
            <button 
              onClick={() => navigate("/lecturer/create-course")}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <span className="text-xl">+</span> Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition duration-300 transform hover:-translate-y-1"
            >
              {/* Course Header with Gradient */}
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                      <FaBook className="text-white text-xl" />
                    </div>
                    <button className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition duration-200">
                      <FaEllipsisV className="text-base" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{course.course_code}</h3>
                  <p className="text-blue-100 text-sm line-clamp-2">{course.course_name}</p>
                </div>
              </div>

              {/* Course Body */}
              <div className="p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-gray-200">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center hover:shadow-md transition duration-200">
                    <FaUsers className="text-blue-600 text-2xl mx-auto mb-2" />
                    <p className="text-gray-700 text-xs font-semibold">Enrolled</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center hover:shadow-md transition duration-200">
                    <FaClipboardList className="text-blue-600 text-2xl mx-auto mb-2" />
                    <p className="text-gray-700 text-xs font-semibold">Sessions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 text-white rounded-lg font-semibold transition duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                    <FaClipboardList className="text-base" />
                    Start Attendance
                  </button>
                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg font-semibold transition duration-200 flex items-center justify-center gap-2">
                      <FaEdit className="text-base" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="flex-1 px-4 py-3 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-lg font-semibold transition duration-200 flex items-center justify-center gap-2 group-hover:border-red-400"
                    >
                      <FaTrash className="text-base" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Course Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    {course.course_code}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}