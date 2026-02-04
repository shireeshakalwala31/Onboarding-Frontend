// src/App.js
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPasswword";

import OnboardingLinkPage from "./pages/OnboardingLinkPage";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ---------- NORMAL AUTH (OPTIONAL) ---------- */}
          <Route path="/onboarding/:token/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />

          {/* ---------- CANDIDATE ONBOARDING ---------- */}
          {/* Step 1: Candidate opens email link → LOGIN UI */}
          {/* <Route
            path="/onboarding/:token/login"
            element={<OnboardingLinkPage />}
          /> */}

          {/* Step 2: After login → SAME PAGE shows onboarding form */}
          {/* <Route
            path="/onboarding/:token"
            element={<OnboardingLinkPage />}
          /> */}

          {/* ---------- FALLBACK ---------- */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
