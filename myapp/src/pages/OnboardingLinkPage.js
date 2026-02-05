import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import EmployeeForm from "../components/EmployeeForm";
import Sidebar from "../Sidebar";

import {
  validateOnboardingLink,
  saveLinkSection,
  submitLinkDeclaration,
  authenticateOnboardingLink,
} from "../api/onboardingApi";

import { getOnboardingLinkLoginInfo } from "../api/onboardingApi";

export default function OnboardingLinkPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔑 Detect login URL correctly
  const isLoginRoute = location.pathname.endsWith("/login");

  // Steps
  const steps = [
    "personal",
    "pf",
    "academic",
    "experience",
    "family",
    "declaration",
  ];

  const refs = {
    personal: useRef(null),
    pf: useRef(null),
    academic: useRef(null),
    experience: useRef(null),
    family: useRef(null),
    declaration: useRef(null),
  };

  // ---------------- STATE ----------------
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

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const currentStep = steps[currentStepIndex];

  // ---------------- AUTH CHECK ----------------
  useEffect(() => {
    const jwt = localStorage.getItem("token");
    if (jwt) {
      setIsAuthenticated(true);
    }
  }, []);

  // ---------------- PREFILL EMAIL ----------------
  useEffect(() => {
    if (!token || isAuthenticated) return;

    (async () => {
      try {
        const info = await getOnboardingLinkLoginInfo(token);
        if (info?.email) setUsername(info.email);
      } catch (e) {
        console.log("Prefill email skipped");
      }
    })();
  }, [token, isAuthenticated]);

  // ---------------- LOGIN ----------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!password) {
      setLoginError("Password is required");
      return;
    }

    try {
      setLoginLoading(true);

      const resp = await authenticateOnboardingLink(token, {
        email: username,
        password,
      });

      if (!resp?.token) {
        setLoginError("Invalid login response");
        return;
      }

      // 🔑 STORE EXACTLY WHAT BACKEND RETURNS
      localStorage.setItem("token", resp.token);
      localStorage.setItem("onboardingToken", resp.onboardingToken);

      setIsAuthenticated(true);
      setPassword("");

      // 🚀 MOVE TO FORM URL (NO /login)
      navigate(`/onboarding/${token}`, { replace: true });

    } catch (err) {
      setLoginError(
        err.response?.data?.message || "Invalid password"
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // ---------------- LOAD PROGRESS (ONLY AFTER LOGIN) ----------------
  useEffect(() => {
    if (!isAuthenticated || !token || isLoginRoute) return;

    (async () => {
      try {
        setLoading(true);
        const res = await validateOnboardingLink(token);

        if (res.isExpired) {
          setLinkExpired(true);
          setErrorMessage("This onboarding link is expired");
          return;
        }

        setProgressData(res);
        setCompletionPercentage(res.completionPercentage || 0);

        setFormData({
          personal: res.personal?.data || {},
          pf: res.pf?.data || {},
          academics: res.academic?.data || [],
          experience: res.experience?.data || [],
          family: res.family?.data || [],
          declaration: res.declaration?.data || {},
        });

        const next = res.nextSection || "personal";
        setCurrentStepIndex(steps.indexOf(next));
        setActive(next);

      } catch (e) {
        setErrorMessage("Failed to validate onboarding link");
        setLinkExpired(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, token, isLoginRoute]);

  // ---------------- SAVE SECTION ----------------
  const handleSave = async (data) => {
    const section = currentStep === "academic" ? "academic" : currentStep;
    await saveLinkSection(token, section, data);
    const updated = await validateOnboardingLink(token);
    setProgressData(updated);
    setCompletionPercentage(updated.completionPercentage || 0);
    nextStep();
  };

  const nextStep = () => {
    setCurrentStepIndex((i) => Math.min(i + 1, steps.length - 1));
    setActive(steps[Math.min(currentStepIndex + 1, steps.length - 1)]);
  };

  // ---------------- DECLARATION ----------------
  const handleDeclarationSubmit = async () => {
    await submitLinkDeclaration(token, formData.declaration);
    alert("Onboarding completed successfully");
    navigate("/login");
  };

  // ---------------- UI ----------------
  if (loading && !isLoginRoute) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  // 🔐 LOGIN PAGE (ONLY FOR /login)
  if (!isAuthenticated && isLoginRoute) {
    return (
      <form onSubmit={handleLoginSubmit} className="p-10 max-w-md mx-auto">
        <h2 className="text-2xl mb-4">Onboarding Login</h2>

        <input
          value={username}
          readOnly
          className="w-full mb-3 p-2 border"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-3 p-2 border"
        />

        {loginError && <p className="text-red-600">{loginError}</p>}

        <button
          disabled={loginLoading}
          className="bg-blue-600 text-white px-4 py-2"
        >
          {loginLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    );
  }

  if (linkExpired || errorMessage) {
    return <div className="p-10 text-center">{errorMessage}</div>;
  }

  // 📝 ONBOARDING FORM
  return (
    <div className="flex">
      <Sidebar steps={steps} active={active} />
      <EmployeeForm
        refs={refs}
        currentStep={currentStep}
        steps={steps}
        onSave={handleSave}
        token={token}
        onDeclarationSubmit={handleDeclarationSubmit}
      />
    </div>
  );
}
