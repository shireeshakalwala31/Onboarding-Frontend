// src/components/Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Same base URL we used in Login
const AUTH_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://offer-documentation.onrender.com/api";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");   // ✅ separate fields
  const [lastName, setLastName] = useState("");    // ✅ separate fields
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const goToLogin = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic frontend validation
    if (!email || !firstName || !lastName || !password) {
      alert("Please fill all fields (First Name, Last Name, Email, Password).");
      return;
    }

    if (!acceptTerms) {
      alert("Please accept the terms of the agreement.");
      return;
    }

    try {
      setLoading(true);

      // 🔗 CALL YOUR BACKEND REGISTER API
      // Backend expects: firstName, lastName, email, password
      const res = await axios.post(`${AUTH_BASE_URL}/employee/register`, {
        firstName,
        lastName,
        email,
        password,
      });

      console.log("Register response:", res.data);

      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);
      const msg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-500 px-4">
      {/* Main Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left panel */}
        <div className="relative md:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-10 flex flex-col justify-between">
          {/* Top link */}
          <button
            type="button"
            onClick={goToLogin}
            className="text-sm opacity-80 mb-6 text-left hover:underline"
          >
            &lt; Home Page
          </button>

          {/* Center text */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Get Started</h1>
            <p className="text-sm md:text-base opacity-90">
              Already have an account?
            </p>
            <button
              type="button"
              onClick={goToLogin}
              className="mt-2 px-8 py-2 rounded-full border border-white text-white text-sm md:text-base font-medium hover:bg-white hover:text-indigo-600 transition"
            >
              Log in
            </button>
          </div>

          {/* Decorative bubbles */}
          <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-indigo-400 opacity-40" />
          <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-blue-400 opacity-30" />
        </div>

        {/* Right panel (form) */}
        <div className="md:w-1/2 bg-white p-8 md:p-10 relative">
          {/* Need help text */}
          <div className="absolute top-4 right-6 text-xs text-gray-500">
            Need help?
          </div>

          <h2 className="text-2xl font-semibold text-center text-indigo-600 mb-6">
            Create account
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="firstname"
                className="text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id="firstname"
                type="text"
                placeholder="John"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="lastname"
                className="text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id="lastname"
                type="text"
                placeholder="Doe"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="********"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            
            {/* Checkbox */}
            <div className="flex items-start space-x-2 pt-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 border-gray-300 rounded focus:ring-indigo-500"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
            </div>
            <label
              htmlFor="terms"
              className="text-xs text-gray-600 leading-5"
            >
              I accept the terms of the agreement
            </label>

            {/* Sign up button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-md hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
