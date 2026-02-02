// src/App.js
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

//✅ Use the Login component you showed me
import Login from "./pages/Login";

// ✅ Adjust these paths based on your project structure
import Register from "./pages/Register";

import ResetPassword from "./pages/ResetPassword";

import OnboardingFormPage from "./pages/OnboardingFormPage";
import OnboardingLinkPage from "./pages/OnboardingLinkPage";


import { AuthProvider } from "./contexts/AuthContext";
import ForgotPassword from "./pages/ForgotPasswword";


const PrivateRoute = ({ children }) => {

  const isAuthenticated = true;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />

          {/* Onboarding link page (Public - candidate) */}
<Route
  path="/onboarding/:token"
  element={<OnboardingLinkPage />}
/>

{/* Onboarding login page (Public - candidate login form) */}
<Route
  path="/onboarding/:token/login"
  element={<Login />}
/>

{/* Onboarding form page (Admin/Internal) */}
<Route
  path="/onboarding"
  element={
    <PrivateRoute>
      <OnboardingFormPage />
    </PrivateRoute>
  }
/>

          

   

          {/* Default: go to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
