import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FaCog, FaUser, FaBell, FaLock, FaSave, FaKey } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

export default function LecturerSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    name: "",
    email: "",
    notifications: true,
    emailAlerts: true,
    autoEndSessions: false,
    sessionTimeout: 60, // minutes
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

      setSettings(prev => ({
        ...prev,
        name: user.user_metadata?.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: settings.name }
      });

      if (error) throw error;

      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Error updating profile: " + error.message);
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("New passwords don't match!");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage("Error updating password: " + error.message);
    }
    setLoading(false);
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setMessage("");

    try {
      // In a real app, you'd save these to a user_preferences table
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage("Preferences saved successfully!");
    } catch (error) {
      setMessage("Error saving preferences: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            to="/lecturer"
            className="mr-4 text-blue-500 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>
          <FaCog className="text-gray-500 mr-3" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">
            Settings
          </h2>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes("Error") || message.includes("don't match") || message.includes("must be")
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-green-50 border border-green-200 text-green-800"
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <FaUser className="text-blue-500 mr-3" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({...settings, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed here. Contact administrator if needed.
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaSave />
                )}
                Save Profile
              </button>
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <FaKey className="text-green-500 mr-3" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading || !newPassword || !confirmPassword}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaKey />
                )}
                Change Password
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <FaBell className="text-purple-500 mr-3" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email alerts for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Session Alerts</p>
                  <p className="text-sm text-gray-600">Get notified when students join your sessions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Session Preferences */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <FaLock className="text-orange-500 mr-3" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Session Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto-end Sessions</p>
                  <p className="text-sm text-gray-600">Automatically end sessions after a period of inactivity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoEndSessions}
                    onChange={(e) => setSettings({...settings, autoEndSessions: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              {settings.autoEndSessions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                onClick={handleSavePreferences}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaSave />
                )}
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}