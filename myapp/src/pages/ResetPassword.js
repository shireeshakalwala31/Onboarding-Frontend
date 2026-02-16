import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const auth = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  // If user opens /reset directly without coming from /forgot
  useEffect(() => {
    if (!email) {
      nav("/forgot");
    }
  }, [email, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    if (!password || !confirm) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      // Make sure your AuthContext has a resetPassword(email, otp, newPassword) function
      await auth.resetPassword(email, otp, password);
      alert("Password has been reset successfully. Please login with new password.");
      nav("/login");
    } catch (err) {
      console.error(err);
      setError("Failed to reset password. Please check OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    nav("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#59a6f5] px-4">
      <div className="relative">
        {/* Long shadow background (for style) */}
        <div className="absolute top-8 left-24 w-[420px] h-[260px] bg-[#3f89d6] rotate-[35deg] -z-10 opacity-70"></div>

        {/* Card */}
        <div className="w-[420px] bg-white rounded-md shadow-xl pt-12 pb-8 px-10 relative">
          {/* Circle with key icon */}
          <div className="absolute -top-9 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 rounded-full bg-[#3949ab] flex items-center justify-center shadow-md">
              <span className="text-white text-2xl">🔑</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-[#3949ab] text-center mb-1">
            Reset Password
          </h1>
          {email && (
            <p className="text-xs text-center text-gray-500 mb-4 break-all">
              For: <span className="font-medium">{email}</span>
            </p>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP */}
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-semibold text-[#3949ab] mb-1"
              >
                OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP sent to your email"
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#3949ab]"
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#3949ab] mb-1"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#3949ab]"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm"
                className="block text-sm font-semibold text-[#3949ab] mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#3949ab]"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-1.5 bg-[#3949ab] text-white text-sm font-semibold rounded-sm hover:bg-[#303f9f] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Continue"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-[#3949ab] hover:underline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
