import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.sendOtp(email);
      nav("/reset", { state: { email } }); // pass email to reset page
    } catch (err) {
      alert("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => nav("/login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 px-4">
      {/* Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Illustration */}
        <div className="md:w-1/2 bg-white flex items-center justify-center p-10 relative">
          <div className="relative">
            {/* Phone box */}
            <div className="w-40 h-64 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-3xl">🔒</span>
              </div>
            </div>

            {/* Person (simplified icon style) */}
            <div className="absolute -bottom-7 -left-10 flex items-end gap-1">
              <div className="w-10 h-10 bg-orange-500 rounded-full" />
              <div className="w-20 h-10 bg-gray-800 rounded-t-2xl" />
            </div>

            {/* Plant */}
            <div className="absolute -bottom-2 -right-10">
              <div className="w-10 h-16 bg-white shadow-md rounded-t-xl flex justify-center items-end">
                <div className="w-6 h-8 bg-blue-400 rounded-b-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-2">
            Forgot
          </h1>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6">
            Your Password?
          </h1>

          <form onSubmit={submit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full border-b-2 border-blue-300 focus:border-blue-600 py-2 outline-none text-sm"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm font-semibold tracking-wide transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "SEND OTP"}
            </button>
          </form>

          {/* Back to login */}
          <button
            onClick={goToLogin}
            className="text-sm mt-6 text-gray-500 hover:text-gray-700 underline-offset-2"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
