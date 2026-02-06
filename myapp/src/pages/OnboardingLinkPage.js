// src/pages/OnboardingLinkPage.js
import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import EmployeeForm from "../components/EmployeeForm";
import Sidebar from "../Sidebar";

import {
  validateOnboardingLink,
  saveLinkSection,
  submitLinkDeclaration,
  authenticateOnboardingLink,
  getOnboardingLinkLoginInfo,
} from "../api/onboardingApi";

export default function OnboardingLinkPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔑 detect /login route
  const isLoginRoute = location.pathname.endsWith("/login");

  // steps
  const steps = ["personal", "pf", "academic", "experience", "family", "declaration"];

  const refs = {
    personal: useRef(null),
    pf: useRef(null),
    academic: useRef(null),
    experience: useRef(null),
    family: useRef(null),
    declaration: useRef(null),
  };

  // ---------------- STATE ----------------
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [active, setActive] = useState("personal");
  const currentStep = steps[currentStepIndex];

  const [formData, setFormData] = useState({
    personal: {},
    pf: {},
    academics: [],
    experience: [],
    family: [],
    declaration: {},
  });

  // login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // ---------------- AUTH CHECK ----------------
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsAuthenticated(true);
    }
  }, []);

  // ---------------- PREFILL EMAIL (LOGIN ONLY) ----------------
  useEffect(() => {
    if (!isLoginRoute || !token) return;

    getOnboardingLinkLoginInfo(token)
      .then(res => res?.email && setUsername(res.email))
      .catch(() => {});
  }, [token, isLoginRoute]);

  // ---------------- LOGIN ----------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      setLoginLoading(true);

      const res = await authenticateOnboardingLink(token, {
        email: username,
        password,
      });

      localStorage.setItem("token", res.token);
      localStorage.setItem("onboardingToken", res.onboardingToken);

      setIsAuthenticated(true);
      navigate(`/onboarding/${token}`, { replace: true });

    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid password");
    } finally {
      setLoginLoading(false);
    }
  };

  // ---------------- LOAD ONBOARDING (AFTER LOGIN) ----------------
  useEffect(() => {
    if (isLoginRoute || !isAuthenticated || !token) return;

    (async () => {
      try {
        setLoading(true);
        const res = await validateOnboardingLink(token);

        if (res.isExpired) {
          setLinkExpired(true);
          setErrorMessage("Onboarding link expired");
          return;
        }

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

      } catch {
        setErrorMessage("Invalid onboarding link");
        setLinkExpired(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, isLoginRoute, token]);

  // ---------------- SAVE ----------------
  const handleSave = async (data) => {
    const section = currentStep === "academic" ? "academic" : currentStep;
    await saveLinkSection(token, section, data);
    setCurrentStepIndex(i => Math.min(i + 1, steps.length - 1));
    setActive(steps[Math.min(currentStepIndex + 1, steps.length - 1)]);
  };

  // ---------------- DECLARATION ----------------
  const handleDeclarationSubmit = async () => {
    await submitLinkDeclaration(token, formData.declaration);
    alert("Onboarding completed");
    navigate("/login");
  };

  // ---------------- UI ----------------

  // 🔐 LOGIN PAGE
  if (isLoginRoute && !isAuthenticated) {
    return (
      <form onSubmit={handleLoginSubmit} className="p-10 max-w-md mx-auto">
        <h2 className="text-2xl mb-4">Onboarding Login</h2>

        <input value={username} readOnly className="w-full mb-3 p-2 border" />

        <input
          type="password"
          className="w-full mb-3 p-2 border"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {loginError && <p className="text-red-600">{loginError}</p>}

        <button className="bg-blue-600 text-white px-4 py-2">
          {loginLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    );
  }

  // ⏳ LOADING
  if (loading) {
    return <div className="p-10 text-center">Loading onboarding…</div>;
  }

  // ❌ ERROR
  if (linkExpired || errorMessage) {
    return <div className="p-10 text-center">{errorMessage}</div>;
  }

  // 📝 FORM
  return (
    <div className="flex">
      <Sidebar steps={steps} active={active} />
      <EmployeeForm
        refs={refs}
        steps={steps}
        currentStep={currentStep}
        initialData={formData}
        onSave={handleSave}
        token={token}
        onDeclarationSubmit={handleDeclarationSubmit}
        mode="link"
      />
    </div>
  );
}
