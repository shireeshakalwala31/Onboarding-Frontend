// src/App.js
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

          {/* Normal auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />

          {/* Candidate onboarding */}
          <Route path="/onboarding/:token/login" element={<OnboardingLinkPage />} />
          <Route path="/onboarding/:token" element={<OnboardingLinkPage />} />

          {/* Admin onboarding (protected) */}
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <OnboardingFormPage />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
