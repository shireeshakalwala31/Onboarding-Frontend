// src/pages/OnboardingLinkPage.js
import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeForm from "../components/EmployeeForm";
import Sidebar from "../Sidebar";
import {
  validateOnboardingLink,
  saveLinkSection,
  submitLinkDeclaration,
} from "../api/onboardingApi";

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

  const currentStep = steps[currentStepIndex];

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
  }, [token]);

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
