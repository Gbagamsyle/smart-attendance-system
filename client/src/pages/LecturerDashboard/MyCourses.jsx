import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { FaBook, FaUsers, FaClipboardList, FaTrash, FaEllipsisV, FaEdit } from "react-icons/fa";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

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
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <p className="text-gray-600 text-sm mt-1">Manage and teach your courses</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your courses...</p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaBook className="text-blue-600 text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-6">You haven't created any courses. Start by creating your first course to begin teaching.</p>
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200">
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition duration-300 transform hover:scale-105"
            >
              {/* Course Header with Gradient */}
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-5 rounded-full -ml-4 -mb-4"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <FaBook className="text-white text-lg" />
                    </div>
                    <button className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition duration-200">
                      <FaEllipsisV className="text-sm" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold">{course.course_code}</h3>
                  <p className="text-blue-100 text-sm mt-1 line-clamp-2">{course.course_name}</p>
                </div>
              </div>

              {/* Course Body */}
              <div className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg p-3 text-center hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-50 transition duration-200">
                    <FaUsers className="text-blue-500 text-xl mx-auto mb-1" />
                    <p className="text-gray-600 text-xs font-medium">Enrolled</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">0</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg p-3 text-center hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-50 transition duration-200">
                    <FaClipboardList className="text-blue-500 text-xl mx-auto mb-1" />
                    <p className="text-gray-600 text-xs font-medium">Sessions</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">0</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button className="w-full px-3 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                    <FaClipboardList className="text-sm" />
                    Start Attendance
                  </button>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-1">
                      <FaEdit className="text-sm" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="flex-1 px-3 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-1 group-hover:border-red-300"
                    >
                      <FaTrash className="text-sm" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Course Badge */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {course.course_code}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}