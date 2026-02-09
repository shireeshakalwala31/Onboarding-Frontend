// src/components/Experience.jsx
import React, { useState, useEffect } from "react";
import { saveExperienceDetails } from "../api/onboardingApi";

export default function Experience({
  form = {},
  setForm,
  refs = {},
  onPrev,
  onSave,
  onNext,
}) {
  const [errors, setErrors] = useState({});

  // Ensure experience array exists
  useEffect(() => {
    if (!Array.isArray(form.experience) || form.experience.length === 0) {
      setForm((p = {}) => ({
        ...p,
        experience: [
          {
            employerName: "",
            employerAddress: "",
            fromDate: "",
            toDate: "",
            designation: "",
            salaryPA: "",
            industry: "",
            reasonForLeaving: "",
          },
        ],
      }));
    }
  }, []);

  const rows = form.experience || [];

  // Add new row
  const addRow = () => {
    setForm({
      ...form,
      experience: [
        ...rows,
        {
          employerName: "",
          employerAddress: "",
          fromDate: "",
          toDate: "",
          designation: "",
          salaryPA: "",
          industry: "",
          reasonForLeaving: "",
        },
      ],
    });
  };

  // Remove row
  const removeRow = (index) => {
    const next = [...rows];
    next.splice(index, 1);
    setForm({ ...form, experience: next });
  };

  // Update row fields
  const updateRow = (index, e) => {
    const { name, value } = e.target;
    const next = [...rows];
    next[index] = { ...next[index], [name]: value };
    setForm({ ...form, experience: next });
  };

  // Update top-level fields
  const updateField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Validate all before saving
  const validateAll = () => {
    const newErrors = {};

    rows.forEach((r, i) => {
      const rowErr = {};
      if (!r.employerName.trim()) rowErr.employerName = "Employer name required";
      if (!r.fromDate.trim()) rowErr.fromDate = "From date required";
      if (!r.toDate.trim()) rowErr.toDate = "To date required";
      if (!r.designation.trim()) rowErr.designation = "Designation required";

      if (Object.keys(rowErr).length > 0) newErrors[i] = rowErr;
    });

    if (!form.functionalSkills?.trim())
      newErrors.functionalSkills = "Functional skills required";

    if (!form.nomineeName?.trim())
      newErrors.nomineeName = "Nominee name required";
    if (!form.nomineeDob?.trim())
      newErrors.nomineeDob = "Nominee DOB required";
    if (!form.nomineeRelationship?.trim())
      newErrors.nomineeRelationship = "Nominee relationship required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Build final experience list for backend
  const buildNormalizedExperience = () => {
    const draftId = form.draftId || localStorage.getItem("draftId") || "";

    const top = {
      functionalSkills: form.functionalSkills || "",
      technicalSkills: form.technicalSkills || "",
      professionalAchievements: form.professionalAchievements || "",
      nomineeName: form.nomineeName || "",
      nomineeDob: form.nomineeDob || "",
      nomineeRelationship: form.nomineeRelationship || "",
      height: form.height || "",
      weight: form.weight || "",
      powerOfGlassLeft: form.powerOfGlassLeft || "",
      powerOfGlassRight: form.powerOfGlassRight || "",
      majorSurgeryOrIllness: form.majorSurgeryOrIllness || "",
      prolongedSickness: form.prolongedSickness || "",
      accidentHistory: form.accidentHistory || "",
      foreignObjectInBody: form.foreignObjectInBody || "",
    };

    return rows.map((row, index) => ({
      draftId,
      serialNo: index + 1,

      employerName:
        row.employerName ??
        row.companyName ??
        row.organization ??
        row.employer ??
        "",

      employerAddress: row.employerAddress ?? row.address ?? "",
      designation: row.designation ?? row.role ?? "",
      fromDate:
        row.fromDate ??
        row.startDate ??
        row.from ??
        "",
      toDate:
        row.toDate ??
        row.endDate ??
        row.to ??
        "",
      salaryPA: row.salaryPA ?? row.salary ?? "",
      industry: row.industry ?? "",
      reasonForLeaving: row.reasonForLeaving ?? "",

      // Inject top-level fields (if not overridden per row)
      functionalSkills: row.functionalSkills || top.functionalSkills,
      technicalSkills: row.technicalSkills || top.technicalSkills,
      professionalAchievements:
        row.professionalAchievements || top.professionalAchievements,

      nomineeName: row.nomineeName || top.nomineeName,
      nomineeDob: row.nomineeDob || top.nomineeDob,
      nomineeRelationship:
        row.nomineeRelationship || top.nomineeRelationship,

      height: row.height || top.height,
      weight: row.weight || top.weight,
      powerOfGlassLeft: row.powerOfGlassLeft || top.powerOfGlassLeft,
      powerOfGlassRight: row.powerOfGlassRight || top.powerOfGlassRight,

      majorSurgeryOrIllness:
        row.majorSurgeryOrIllness || top.majorSurgeryOrIllness,
      prolongedSickness:
        row.prolongedSickness || top.prolongedSickness,
      accidentHistory:
        row.accidentHistory || top.accidentHistory,
      foreignObjectInBody:
        row.foreignObjectInBody || top.foreignObjectInBody,
    }));
  };

  const saveToBackend = async () => {
    const draftId = form.draftId || localStorage.getItem("draftId");
    const normalized = buildNormalizedExperience();
    return await saveExperienceDetails(draftId, normalized);
  };

  const handleSaveClick = async () => {
    if (!validateAll()) return;

    const res = await saveToBackend();
    setForm((p) => ({ ...p, experience: res.data }));
    alert("Experience saved successfully");
  };

  const handleNextClick = async () => {
    if (!validateAll()) return;
    await handleSaveClick();
    if (typeof onNext === "function") onNext();
  };

  return (
    <section className="card" ref={refs?.experience} style={{ scrollMarginTop: 80 }}>
      <h3 className="section-title">Professional Experience</h3>

      {/* EXPERIENCE TABLE */}
      <div className="space-y-4">
        <button type="button" onClick={addRow} className="px-3 py-1 bg-blue-600 text-white rounded">
          + Add Experience
        </button>

        {rows.map((r, idx) => (
          <div key={idx} className="border rounded p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

              <div>
                <label className="label">Employer Name *</label>
                <input className="input" name="employerName" value={r.employerName} onChange={(e) => updateRow(idx, e)} />
                {errors[idx]?.employerName && <div className="text-red-600">{errors[idx].employerName}</div>}
              </div>

              <div>
                <label className="label">Employer Address</label>
                <input className="input" name="employerAddress" value={r.employerAddress} onChange={(e) => updateRow(idx, e)} />
              </div>

              <div>
                <label className="label">From Date *</label>
                <input className="input" name="fromDate" value={r.fromDate} onChange={(e) => updateRow(idx, e)} />
                {errors[idx]?.fromDate && <div className="text-red-600">{errors[idx].fromDate}</div>}
              </div>

              <div>
                <label className="label">To Date *</label>
                <input className="input" name="toDate" value={r.toDate} onChange={(e) => updateRow(idx, e)} />
                {errors[idx]?.toDate && <div className="text-red-600">{errors[idx].toDate}</div>}
              </div>

              <div>
                <label className="label">Designation *</label>
                <input className="input" name="designation" value={r.designation} onChange={(e) => updateRow(idx, e)} />
              </div>

              <div>
                <label className="label">Salary PA</label>
                <input className="input" name="salaryPA" value={r.salaryPA} onChange={(e) => updateRow(idx, e)} />
              </div>

              <div>
                <label className="label">Industry</label>
                <input className="input" name="industry" value={r.industry} onChange={(e) => updateRow(idx, e)} />
              </div>
            </div>

            <button type="button" className="mt-3 px-3 py-1 bg-red-600 text-white rounded" onClick={() => removeRow(idx)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Functional Skills */}
      <div className="mt-5">
        <label className="label">Functional / Technical Skills *</label>
        <textarea className="input" value={form.functionalSkills} onChange={(e) => updateField("functionalSkills", e.target.value)} />
        {errors.functionalSkills && <div className="text-red-600">{errors.functionalSkills}</div>}
      </div>

      {/* Professional Achievements */}
      <div className="mt-5">
        <label className="label">Professional Achievements</label>
        <textarea className="input" value={form.professionalAchievements} onChange={(e) => updateField("professionalAchievements", e.target.value)} />
      </div>

      {/* Nominee Section */}
      <div className="border rounded p-4 bg-gray-50 mt-5">
        <h4 className="font-semibold mb-3">Nominee Details</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="label">Nominee Name *</label>
            <input className="input" value={form.nomineeName} onChange={(e) => updateField("nomineeName", e.target.value)} />
          </div>

          <div>
            <label className="label">Nominee DOB *</label>
            <input className="input" value={form.nomineeDob} onChange={(e) => updateField("nomineeDob", e.target.value)} />
          </div>

          <div>
            <label className="label">Relationship *</label>
            <input className="input" value={form.nomineeRelationship} onChange={(e) => updateField("nomineeRelationship", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Health Section */}
      <div className="border rounded p-4 bg-gray-50 mt-5">
        <h4 className="font-semibold mb-3">Health Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div><label className="label">Height</label><input className="input" value={form.height} onChange={(e) => updateField("height", e.target.value)} /></div>
          <div><label className="label">Weight</label><input className="input" value={form.weight} onChange={(e) => updateField("weight", e.target.value)} /></div>
          <div><label className="label">Power Glass (L)</label><input className="input" value={form.powerOfGlassLeft} onChange={(e) => updateField("powerOfGlassLeft", e.target.value)} /></div>
          <div><label className="label">Power Glass (R)</label><input className="input" value={form.powerOfGlassRight} onChange={(e) => updateField("powerOfGlassRight", e.target.value)} /></div>
        </div>

        <div className="mt-3">
          <label className="label">Major Surgery / Illness</label>
          <textarea className="input" value={form.majorSurgeryOrIllness} onChange={(e) => updateField("majorSurgeryOrIllness", e.target.value)} />
        </div>

        <div className="mt-3">
          <label className="label">Prolonged Sickness</label>
          <textarea className="input" value={form.prolongedSickness} onChange={(e) => updateField("prolongedSickness", e.target.value)} />
        </div>

        <div className="mt-3">
          <label className="label">Accident History</label>
          <textarea className="input" value={form.accidentHistory} onChange={(e) => updateField("accidentHistory", e.target.value)} />
        </div>

        <div className="mt-3">
          <label className="label">Foreign Objects in Body</label>
          <textarea className="input" value={form.foreignObjectInBody} onChange={(e) => updateField("foreignObjectInBody", e.target.value)} />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between items-center">
        <button type="button" onClick={onPrev} className="px-5 py-2 border rounded">← Previous</button>

        <div className="flex gap-3">
          <button type="button" onClick={handleSaveClick} className="px-5 py-2 border rounded">Save</button>
          <button type="button" onClick={handleNextClick} className="px-6 py-2 bg-blue-600 text-white rounded">Next →</button>
        </div>
      </div>
    </section>
  );
}