// src/App.js
// TEST CHANGE - CHECK GIT

import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPasswword";

import OnboardingLinkPage from "./pages/OnboardingLinkPage";
import OnboardingFormPage from "./pages/OnboardingFormPage";

import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* 🔹 Candidate onboarding login */}
          <Route
            path="/onboarding/:id/login"
            element={<Login />}
          />

          {/* 🔹 Candidate onboarding form */}
          <Route
            path="/onboarding/:id"
            element={<OnboardingLinkPage />}
          />

          {/* 🔹 Normal auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />

          {/* 🔹 Admin (protected) */}
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <OnboardingFormPage />
              </PrivateRoute>
            }
          />

          {/* 🔹 Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
