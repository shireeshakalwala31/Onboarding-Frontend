// src/components/Login.js
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Base URL for your backend AUTH routes
// registerAdmin/loginAdmin are under /api/auth/...
const AUTH_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://offer-documentation.onrender.com/api";

const Login = () => {
  const navigate = useNavigate();
  const { id: onboardingToken } = useParams();

  // This holds EMAIL even though label says "User Name"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If we are on an onboarding-link login route, prefetch email for convenience
  React.useEffect(() => {
    if (!onboardingToken) return;
    (async () => {
      try {
        const resp = await axios.get(`${AUTH_BASE_URL}/onboarding-link/${onboardingToken}/login`);
        if (resp?.data?.email) setUsername((u) => u || resp.data.email);
      } catch (err) {
        console.debug("Prefill onboarding email failed:", err?.message || err);
      }
    })();
  }, [onboardingToken]);

  const goToRegister = () => {
    navigate("/register");
  };

  const goToForgotPassword = () => {
    navigate("/forgot"); // only if you have this route
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      if (onboardingToken) {
        // Onboarding login uses token + email + password
        const response = await axios.post(`${AUTH_BASE_URL}/onboarding-link/login`, {
          token: onboardingToken,
          email: username,
          password,
        });
        console.log("Onboarding login response:", response.status, response.data);

        const { token } = response.data;
        if (!token) {
          alert("Login successful but no token returned from server.");
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("onboardingToken", onboardingToken);

        // Navigate to onboarding form for this token
        navigate(`/onboarding/${onboardingToken}`);
      } else {
        // Default employee / admin login flow
        const response = await axios.post(`${AUTH_BASE_URL}/employee/login`, {
          email: username,
          password,
        });
        console.log("Login response:", response.status, response.data);

        // backend returns { message, token, admin }
        const { token, admin } = response.data;

        if (!token) {
          alert("Login successful but no token returned from server.");
          return;
        }

        // 🔐 store token for verifyToken in employee routes
        localStorage.setItem("token", token);

        // optional: store admin info
        if (admin) {
          localStorage.setItem("admin", JSON.stringify(admin));
        }

        // ✅ Go to onboarding page
        navigate("/onboarding");
      }
    } catch (error) {
      console.error("Login error:", error);

      const status = error.response?.status;
      const messageFromServer = error.response?.data?.message;

      if (status === 404) {
        alert(messageFromServer || "Admin not found.");
      } else if (status === 401) {
        alert(messageFromServer || "Invalid password.");
      } else if (status === 400) {
        alert(messageFromServer || "Bad request. Please check your input.");
      } else {
        alert(messageFromServer || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 px-4">
      {/* Card */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Section */}
        <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white p-10 md:p-12 flex flex-col justify-center">
          {/* Circles */}
          <div className="absolute -left-20 -top-20 w-56 h-56 bg-blue-500/40 rounded-full" />
          <div className="absolute -left-10 bottom-10 w-40 h-40 bg-blue-900/40 rounded-full" />
          <div className="absolute -right-10 bottom-[-40px] w-40 h-40 bg-blue-400/60 rounded-full" />

          <div className="relative">
            <p className="text-sm uppercase tracking-[0.25em] mb-2 opacity-80">
              Welcome to
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
              Amazon It Solutions
            </h1>
            <p className="text-sm md:text-base leading-relaxed text-blue-100/90 max-w-md">
              Amazon IT Solutions is a leading technology services company
              delivering secure, scalable, and innovative IT solutions. We
              specialize in cybersecurity, cloud services, and end-to-end
              digital transformation for global clients.
            </p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            Sign in
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username (actually email) */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                User Name
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500">
                <span className="text-gray-400 text-lg">👤</span>
                <input
                  type="text"
                  placeholder="Enter your email"
                  className="w-full bg-transparent outline-none text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500">
                <span className="text-gray-400 text-lg">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full bg-transparent outline-none text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-xs md:text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={goToForgotPassword}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-700 text-white py-2.5 md:py-3 text-sm md:text-base font-semibold shadow-md hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {/* OR Divider */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              <span>OR</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Social login */}
            <button
              type="button"
              className="w-full rounded-lg border border-gray-300 py-2.5 md:py-3 text-sm md:text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign in with other
            </button>
          </form>

          {/* Signup link - HIDDEN */}
          {/* <p className="mt-6 text-xs md:text-sm text-gray-500 text-center">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={goToRegister}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign Up
            </button>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
