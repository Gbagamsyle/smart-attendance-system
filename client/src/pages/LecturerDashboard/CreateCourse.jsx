import { useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaBook } from "react-icons/fa";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const createCourse = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!courseName.trim() || !courseCode.trim()) {
      setErrorMessage("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      setErrorMessage("User not found. Please log in again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("courses")
      .insert([
        {
          course_name: courseName,
          course_code: courseCode,
          lecturer_id: user.id
        }
      ]);

    setLoading(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Course created successfully!");
      setCourseName("");
      setCourseCode("");
      
      setTimeout(() => {
        navigate("/lecturer");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/lecturer")}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaBook className="text-blue-600 text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-gray-600 text-sm">Add a new course to your teaching portfolio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <FaCheckCircle className="text-green-600 text-lg flex-shrink-0" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <FaTimesCircle className="text-red-600 text-lg flex-shrink-0" />
              <p className="text-red-800 font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Course Name */}
            <div>
              <label htmlFor="courseName" className="block text-sm font-semibold text-gray-900 mb-2">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                id="courseName"
                type="text"
                placeholder="e.g., Introduction to Computer Science"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500"
              />
              <p className="text-gray-500 text-xs mt-1">Enter a descriptive name for your course</p>
            </div>

            {/* Course Code */}
            <div>
              <label htmlFor="courseCode" className="block text-sm font-semibold text-gray-900 mb-2">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                id="courseCode"
                type="text"
                placeholder="e.g., CS101"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500"
              />
              <p className="text-gray-500 text-xs mt-1">Unique identifier for your course</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/lecturer")}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={createCourse}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block">↻</span>
                  Creating...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Create Course
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Course names help you organize and identify your courses easily</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Course codes are used for student registration and attendance tracking</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Descriptions are optional but help students understand course objectives</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>You can edit course details after creation from your dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}