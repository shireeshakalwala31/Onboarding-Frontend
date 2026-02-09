// src/components/EmployeeForm.js
import React, { useEffect } from "react";

import Personal from "./Personal";
import PF from "./Pf";
import Academic from "./Academic";
import Experience from "./Experience";
import Family from "./Family";
import Declaration from "./Declaration";
import OfficeUse from "./OfficeUse";

import {
  savePersonalInfo,
  savePFInfo,
  saveAcademicDetails,
  saveExperienceDetails,
  saveFamilyDetails,
  saveDeclarationDetails,
  saveOfficeUseDetails,
  submitOnboarding,
} from "../api/onboardingApi";

export default function EmployeeForm({
  refs = {},
  // step props from App.js
  currentStep = "header",
  currentStepIndex = 0,
  totalSteps = 9,
  nextStep = () => {},
  prevStep = () => {},
  goToStep = () => {},

  // save/edit props
  onSave,
  initialData = null,
  mode = "new",
  onCancelEdit = () => {},
  
  // Link mode props
  linkMode = false,
  token = null,
  onDeclarationSubmit = null,
}) {
  const [form, setForm] = React.useState({
    personal: {},
    pf: {},
    academics: [],
    experience: [],
    family: [],
    declaration: {},
    office: {},
  });

  const [draftId, setDraftId] = React.useState(null);
  const [photoFile, setPhotoFile] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      if (initialData.draftId) {
        setDraftId(initialData.draftId);
      }
    } else {
      // resume draft from SAME key we decided: "draftId"
      const storedDraftId = localStorage.getItem("draftId");
      if (storedDraftId) {
        setDraftId(storedDraftId);
      }
    }
  }, [initialData]);

  // helper to update a top-level key (e.g., "personal", "pf")
  const updateField = (key, value) =>
    setForm((p) => ({ ...p, [key]: value }));

  // helper to update personal sub-object
  const updatePersonal = (patch) =>
    setForm((p) => ({
      ...p,
      personal: { ...(p.personal || {}), ...patch },
    }));

  // ------------- BACKEND SAVE PER STEP -------------
  const saveCurrentStepToServer = async () => {
    if (
      !["header", "photo"].includes(currentStep) &&
      !draftId &&
      currentStep !== "personal"
    ) {
      throw new Error("Draft ID missing. Please save Personal section first.");
    }

    // Header/photo do not hit backend
    if (currentStep === "header" || currentStep === "photo") return;

    try {
      if (currentStep === "personal") {
        const payload = {
          draftId: draftId || "",
          ...form.personal,
        };

        const res = await savePersonalInfo(payload, photoFile);

        // first time: backend generates draftId
        if (!draftId && res.draftId) {
          setDraftId(res.draftId);
          localStorage.setItem("draftId", res.draftId);
        }
      } else if (currentStep === "pf") {
        await savePFInfo(draftId, form.pf || {});
      } else if (currentStep === "academic") {
        await saveAcademicDetails(draftId, form.academics || []);
      } else if (currentStep === "experience") {
        await saveExperienceDetails(draftId, form.experience || []);
      } else if (currentStep === "family") {
        await saveFamilyDetails(draftId, form.family || []);
      } else if (currentStep === "declaration") {
        await saveDeclarationDetails(draftId, form.declaration || {}, {});
      } else if (currentStep === "office") {
        await saveOfficeUseDetails(draftId, form.office || {});
      }
    } catch (err) {
      console.error("Save step error:", err);
      const msg =
        err.response?.data?.message || err.message || "Failed to save";
      window.alert(msg);
      throw err;
    }
  };

  // generic save used by all sections (local + backend)
  const saveSection = async (opts = { stayOnStep: true }) => {
    setSaving(true);
    try {
      await saveCurrentStepToServer();
      if (typeof onSave === "function") onSave(form, opts);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === "personal") {
      if (!form.personal || !form.personal.firstName) {
        window.alert("Please enter first name before continuing.");
        return;
      }
    }
    try {
      await saveSection({ stayOnStep: true });
      nextStep();
    } catch {
      // already alerted
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  const handleFinish = async () => {
    try {
      await saveSection({ stayOnStep: true });

      if (!draftId) {
        window.alert("Draft ID missing. Cannot submit onboarding.");
        return;
      }

      const res = await submitOnboarding(draftId);
      window.alert(res.message || "Onboarding submitted successfully!");

      // clear the same key
      localStorage.removeItem("draftId");

      if (typeof onSave === "function") onSave(form);
    } catch {
      // errors already handled
    }
  };

  const handleSaveOnly = async () => {
    try {
      await saveSection({ stayOnStep: true });
      window.alert("Saved successfully!");
    } catch {
      // already handled
    }
  };

  // photo file -> dataURL preview
  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoFile(file); // raw file for backend

    const reader = new FileReader();
    reader.onload = (ev) => updatePersonal({ photoDataUrl: ev.target.result });
    reader.readAsDataURL(file);
  };

  const stepLabels = {
    header: "Company Header",
    photo: "Photo",
    personal: "Personal Details",
    pf: "Provident Fund",
    academic: "Academic Qualifications",
    experience: "Work Experience",
    family: "Family Details",
    declaration: "Declaration",
    office: "Office Use",
  };

  const topFive = ["header", "photo", "personal", "pf", "academic"];

  return (
    <div className="bg-white rounded-md shadow p-6 space-y-6 w-full">
      {/* Top Title + step buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Step {currentStepIndex + 1} of {totalSteps}:{" "}
            {stepLabels[currentStep]}
          </h2>
          <p className="text-sm text-gray-500">
            Use the Previous, Save, and Next buttons in each section to
            navigate and save your progress.
          </p>
          {draftId && (
            <p className="text-xs text-gray-400 mt-1">
              Draft ID: <span className="font-mono">{draftId}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {mode === "edit" && (
            <button
              onClick={onCancelEdit}
              className="px-3 py-1 border rounded text-sm"
            >
              Cancel Edit
            </button>
          )}

          <div className="flex gap-2">
            {Object.keys(stepLabels).map((id, idx) => (
              <button
                key={id}
                onClick={() => goToStep(id)}
                className={`px-2 py-1 rounded text-sm border ${
                  id === currentStep ? "bg-blue-600 text-white" : "bg-white"
                }`}
                aria-current={id === currentStep}
                disabled={saving}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {saving && (
        <div className="text-sm text-blue-500">Saving, please wait...</div>
      )}

      <div className="space-y-4">
        {/* HEADER */}
        {currentStep === "header" && (
          <section ref={refs.header || null} className="w-full">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
              {/* LEFT: Logo + company text */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-start gap-4">
                  <img
                    src="/AmazonItLogo.png"
                    alt="AmazonItLogo"
                    className="w-24 h-auto object-contain"
                  />
                  <div>
                    <h1 className="text-sm font-bold text-blue-500">
                      Employee Onboarding Form
                    </h1>
                  </div>
                </div>
              </div>

              {/* RIGHT: reserved */}
              <div className="flex-shrink-0" />
            </div>

            {/* Steps 1-5 below the header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-2">
              {topFive.map((id, idx) => (
                <button
                  key={id}
                  onClick={() => goToStep(id)}
                  className={`flex flex-col items-start p-3 rounded border text-left ${
                    id === currentStep
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white"
                  }`}
                  disabled={saving}
                >
                  <div className="text-xs text-gray-500">Step {idx + 1}</div>
                  <div className="text-sm font-medium">
                    {stepLabels[id]}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* PERSONAL */}
        {currentStep === "personal" && (
          <section ref={refs.personal || null} className="w-full">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* LEFT: Personal info */}
              <div className="flex-1">
                <Personal
                  form={form}
                  setForm={setForm}
                  refs={refs}
                  onPrev={handlePrev}
                  onSave={handleSaveOnly}
                  onNext={handleNext}
                />
              </div>

              {/* RIGHT: Photo upload/preview */}
              <div className="w-44 flex-shrink-0">
                <div className="w-40 h-48 border rounded-md p-1 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {form.personal && form.personal.photoDataUrl ? (
                    <img
                      src={form.personal.photoDataUrl}
                      alt="employee"
                      className="max-w-full max-h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-sm text-gray-500">
                      No photo uploaded
                    </div>
                  )}
                </div>

                <label className="mt-2 text-xs text-gray-600 cursor-pointer inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <span className="px-3 py-1 border rounded text-sm">
                    Upload Photo
                  </span>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* PHOTO */}
        {currentStep === "photo" && (
          <section ref={refs.photo || null}>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Photo</h3>
              <div className="w-48 h-56 border rounded-md flex items-center justify-center bg-gray-50">
                {form.personal && form.personal.photoDataUrl ? (
                  <img
                    src={form.personal.photoDataUrl}
                    alt="employee"
                    className="max-w-full max-h-full object-cover"
                  />
                ) : (
                  <div className="text-sm text-gray-500">
                    No photo uploaded
                  </div>
                )}
              </div>

              <label className="mt-3 inline-block text-sm text-gray-600 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <span className="px-3 py-1 border rounded">
                  Upload / Change Photo
                </span>
              </label>
            </div>
          </section>
        )}

        {/* PF */}
        {currentStep === "pf" && (
          <section ref={refs.pf || null}>
            <PF
              form={form}
              setForm={setForm}
              refs={refs}
              onPrev={handlePrev}
              onSave={handleSaveOnly}
              onNext={handleNext}
            />
          </section>
        )}

        {/* ACADEMIC */}
        {currentStep === "academic" && (
          <section ref={refs.academic || null}>
            <Academic
              form={form}
              setForm={setForm}
              refs={refs}
              onPrev={handlePrev}
              onSave={handleSaveOnly}
              onNext={handleNext}
            />
          </section>
        )}

        {/* EXPERIENCE */}
        {currentStep === "experience" && (
          <section ref={refs.experience || null}>
            <Experience
              form={form}
              setForm={setForm}
              refs={refs}
              onPrev={handlePrev}
              onSave={handleSaveOnly}
              onNext={handleNext}
            />
          </section>
        )}

        {/* FAMILY */}
        {currentStep === "family" && (
          <section ref={refs.family || null}>
            <Family
              form={form}
              setForm={setForm}
              refs={refs}
              onPrev={handlePrev}
              onSave={handleSaveOnly}
              onNext={handleNext}
              updateField={updateField}
            />
          </section>
        )}

        {/* DECLARATION */}
        {currentStep === "declaration" && (
          <section ref={refs.declaration || null}>
            <Declaration
              form={form}
              setForm={setForm}
              refs={refs}
              onPrev={handlePrev}
              onSave={handleSaveOnly}
              onFinish={linkMode && onDeclarationSubmit ? onDeclarationSubmit : handleFinish}
            />
          </section>
        )}

        {/* OFFICE USE - Hidden as per requirement */}
        {/* {currentStep === "office" && (
          <section ref={refs.office || null}>
            <OfficeUse
              form={form}
              setForm={setForm}
              refs={refs}
              onPrev={handlePrev}
              onSave={handleSaveOnly}
              onNext={handleNext}
              updateField={updateField}
            />
          </section>
        )} */}
      </div>
    </div>
  );
}
