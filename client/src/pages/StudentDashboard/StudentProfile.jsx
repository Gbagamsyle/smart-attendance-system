import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FaUser, FaEdit, FaSave } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      // Update profile with email if it's missing
      const updateProfileEmail = async () => {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", user.id)
          .single();

        if (!existingProfile?.email && user.email) {
          await supabase
            .from("profiles")
            .update({ email: user.email })
            .eq("id", user.id);
        }
      };

      updateProfileEmail();

      setProfile({
        name: user.user_metadata?.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.updateUser({
      data: { name: profile.name },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Profile updated successfully!");
      setEditing(false);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center mb-6">
          <Link
            to="/student"
            className="mr-4 text-blue-500 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>
          <FaUser className="text-purple-500 mr-3" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">
            My Profile
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {editing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                {profile.name || "Not set"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
              {profile.email}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Email cannot be changed here. Contact administrator if needed.
            </p>
          </div>

          <div className="flex space-x-4">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition duration-200"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition duration-200"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}