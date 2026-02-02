// src/pages/OnboardingLinkPage.js
import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeForm from "../components/EmployeeForm";
import Sidebar from "../Sidebar";
import {
  validateOnboardingLink,
  saveLinkSection,
  submitLinkDeclaration,
  authenticateOnboardingLink,
} from "../api/onboardingApi";
import { getOnboardingLinkLoginInfo } from "../api/onboardingApi";

const AUTH_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://offer-documentation.onrender.com/api";

export default function OnboardingLinkPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  // List of steps (order matters)
  const steps = [
    "personal",
    "pf",
    "academic",
    "experience",
    "family",
    "declaration",
  ];

  // Refs for focusing / scroll anchors
  const refs = {
    personal: useRef(null),
    pf: useRef(null),
    academic: useRef(null),
    experience: useRef(null),
    family: useRef(null),
    declaration: useRef(null),
  };

  // State management
  const [loading, setLoading] = useState(true);
  const [linkExpired, setLinkExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progressData, setProgressData] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [active, setActive] = useState("personal");
  const [formData, setFormData] = useState({
    personal: {},
    pf: {},
    academics: [],
    experience: [],
    family: [],
    declaration: {},
  });

  // Auth state for login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const currentStep = steps[currentStepIndex];

  // Check if user is already authenticated
  useEffect(() => {
    const token_local = localStorage.getItem("token");
    if (token_local) {
      setIsAuthenticated(true);
      setShowLoginForm(false);
    }
  }, []);

  // Prefill email by fetching login info (some backends expose a dedicated login-info endpoint)
  useEffect(() => {
    const fetchLoginInfo = async () => {
      if (!token || isAuthenticated) return;
      try {
        const info = await getOnboardingLinkLoginInfo(token);
        if (info && info.email) setUsername((u) => (u || info.email));
      } catch (err) {
        // ignore; validateOnboardingLink will still be used for progress
        console.debug("getOnboardingLinkLoginInfo failed:", err?.message || err);
      }
    };
    fetchLoginInfo();
  }, [token, isAuthenticated]);

  // Handle login (candidate via onboarding link)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!username || !password) {
      setLoginError("Please enter email and password");
      return;
    }

    try {
      setLoginLoading(true);

      // Use onboarding link authentication endpoint
      const resp = await authenticateOnboardingLink(token, {
        email: username,
        password,
      });

      // Expecting { token: <jwt>, onboardingToken?: <token>, candidate?: {...} }
      const loginToken = resp.token || resp.data?.token;

      if (!loginToken) {
        setLoginError("Login succeeded but server did not return a JWT token.");
        return;
      }

      // Store JWT for subsequent authenticated requests
      localStorage.setItem("token", loginToken);
      if (resp.onboardingToken) localStorage.setItem("onboardingToken", resp.onboardingToken);

      setIsAuthenticated(true);
      setShowLoginForm(false);
      setPassword("");
    } catch (error) {
      console.error("Onboarding login error:", error);
      const status = error.response?.status;
      const messageFromServer = error.response?.data?.message;

      if (status === 401) {
        setLoginError(messageFromServer || "Invalid password.");
      } else if (status === 404) {
        setLoginError(messageFromServer || "Onboarding link or email not found.");
      } else {
        setLoginError(messageFromServer || "Login failed. Please try again.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Validate link and load progress on mount
  useEffect(() => {
    const validateAndLoadProgress = async () => {
      if (!token) {
        setErrorMessage("Invalid onboarding link. Token is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await validateOnboardingLink(token);

        // Check if link is expired
        if (response.isExpired) {
          setLinkExpired(true);
          setErrorMessage(
            "This onboarding link has expired. The onboarding process has been completed."
          );
          setLoading(false);
          return;
        }

        // Load progress data
        setProgressData(response);

        // Prefill the login email (candidate view) so login shows locked email
        const linkEmail = response.email || response.personal?.data?.email || response.personal?.email;
        if (linkEmail) setUsername(linkEmail);
        setCompletionPercentage(response.completionPercentage || 0);

        // Load existing form data from backend
        const loadedData = {
          personal: response.personal?.data || {},
          pf: response.pf?.data || {},
          academics: response.academic?.data || [],
          experience: response.experience?.data || [],
          family: response.family?.data || [],
          declaration: response.declaration?.data || {},
        };
        setFormData(loadedData);

        // Auto-navigate to next incomplete section
        const nextSection = response.nextSection || "personal";
        const nextIndex = steps.indexOf(nextSection);
        if (nextIndex >= 0) {
          setCurrentStepIndex(nextIndex);
          setActive(nextSection);
        }

        setLoading(false);
      } catch (error) {
        console.error("Link validation error:", error);
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Failed to validate onboarding link. Please contact support.";
        setErrorMessage(msg);
        setLinkExpired(true);
        setLoading(false);
      }
    };

    validateAndLoadProgress();
  }, [token, isAuthenticated]);

  // Navigate to named step (from Sidebar)
  const goToStep = (id) => {
    // Prevent navigation to sections that haven't been unlocked yet
    if (!progressData) return;

    const targetIndex = steps.indexOf(id);
    if (targetIndex < 0) return;

    // Check if user can navigate to this section
    // Allow navigation only to completed sections or the next incomplete one
    const sectionKey = id === "academics" ? "academic" : id;
    const isCompleted = progressData[sectionKey]?.completed;
    const isNextSection = id === (progressData.nextSection || "personal");

    if (isCompleted || isNextSection || targetIndex <= currentStepIndex) {
      setCurrentStepIndex(targetIndex);
      setActive(id);
    } else {
      alert(
        `Please complete the previous sections before accessing ${id}.`
      );
    }
  };

  const nextStep = () => {
    setCurrentStepIndex((i) => {
      const next = Math.min(i + 1, steps.length - 1);
      setActive(steps[next]);
      return next;
    });
  };

  const prevStep = () => {
    setCurrentStepIndex((i) => {
      const prev = Math.max(i - 1, 0);
      setActive(steps[prev]);
      return prev;
    });
  };

  // Save section to backend using link API
  const handleSave = async (data, { stayOnStep = false } = {}) => {
    try {
      // Merge the incoming data with existing formData
      const updatedFormData = { ...formData, ...data };
      setFormData(updatedFormData);

      // Determine which section to save based on current step
      let sectionData = null;
      let sectionName = currentStep;

      if (currentStep === "personal") {
        sectionData = updatedFormData.personal;
      } else if (currentStep === "pf") {
        sectionData = updatedFormData.pf;
      } else if (currentStep === "academic") {
        sectionData = { academics: updatedFormData.academics };
        sectionName = "academic";
      } else if (currentStep === "experience") {
        sectionData = { experience: updatedFormData.experience };
      } else if (currentStep === "family") {
        sectionData = { family: updatedFormData.family };
      } else if (currentStep === "declaration") {
        // Declaration is handled separately in handleDeclarationSubmit
        return;
      }

      // Save to backend
      if (sectionData) {
        await saveLinkSection(token, sectionName, sectionData);

        // Reload progress after save
        const updatedProgress = await validateOnboardingLink(token);
        setProgressData(updatedProgress);
        setCompletionPercentage(updatedProgress.completionPercentage || 0);
      }

      if (!stayOnStep && currentStepIndex < steps.length - 1) {
        nextStep();
      }
    } catch (error) {
      console.error("Save error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to save section";
      alert(msg);
      throw error;
    }
  };

  // Handle final declaration submission
  const handleDeclarationSubmit = async () => {
    try {
      // Submit declaration and expire link
      await submitLinkDeclaration(token, formData.declaration);

      alert(
        "Onboarding completed successfully! This link is now expired. Thank you!"
      );

      // Redirect to a thank you page or login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Declaration submission error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit declaration";
      alert(msg);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating your onboarding link...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (showLoginForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 px-4">
        <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left Section */}
          <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white p-10 md:p-12 flex flex-col justify-center">
            <div className="absolute -left-20 -top-20 w-56 h-56 bg-blue-500/40 rounded-full" />
            <div className="absolute -left-10 bottom-10 w-40 h-40 bg-blue-900/40 rounded-full" />
            <div className="absolute -right-10 bottom-[-40px] w-40 h-40 bg-blue-400/60 rounded-full" />

            <div className="relative">
              <p className="text-sm uppercase tracking-[0.25em] mb-2 opacity-80">
                Welcome to
              </p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Employee Onboarding
              </h1>
              <p className="text-base opacity-90 leading-relaxed">
                Please log in to complete your onboarding process. Enter your email and password to get started.
              </p>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="p-10 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Login to Onboard
              </h2>
              <p className="text-gray-600">
                Enter your credentials to access your onboarding form
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={username}
                  readOnly
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {loginError && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Expired or error state
  if (linkExpired || errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Link Expired or Invalid
          </h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        goToStep={goToStep}
        active={active}
        steps={steps}
        onShowList={() => {}} // No list view in link mode
        showListActive={false}
      />

      <main className="ml-64 p-10 w-full">
        {/* Progress Bar */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Onboarding Progress
            </h3>
            <span className="text-sm font-medium text-blue-600">
              {completionPercentage}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Complete all sections to finish your onboarding. Your progress is
            automatically saved.
          </p>
        </div>

        {/* Employee Form */}
        <EmployeeForm
          refs={refs}
          steps={steps}
          currentStep={currentStep}
          currentStepIndex={currentStepIndex}
          totalSteps={steps.length}
          goToStep={goToStep}
          nextStep={nextStep}
          prevStep={prevStep}
          onSave={handleSave}
          mode="link"
          initialData={formData}
          linkMode={true}
          token={token}
          onDeclarationSubmit={handleDeclarationSubmit}
        />
      </main>
    </div>
  );
}
