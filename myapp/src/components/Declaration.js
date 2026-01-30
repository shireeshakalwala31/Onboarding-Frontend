// src/components/Declaration.jsx
import React, { useEffect } from "react";

/* HELPERS */
const boolToYesNo = (v) => (v === true ? "Yes" : v === false ? "No" : "");
const yesNoToBool = (v) => (v === "Yes" ? true : v === "No" ? false : v);

export default function Declaration({
  form = {},
  setForm,
  refs = {},
  onPrev,
  onSave,
  onFinish,
  onNext,
}) {
  const declaration = form.declaration || {};

  const fullName =
    `${form.personal?.firstName || ""} ${form.personal?.lastName || ""}`.trim();

  /* UPDATE HANDLER */
  const update = (e) => {
    const { name, value } = e.target;

    const yesNoFields = [
      "keepOriginalCertificates",
      "agreeServiceAgreement",
      "willingToWorkAnyUnit",
      "agreeOtherTerms",
      "doYouSmoke",
      "areYouAlcoholic",
      "medicallyFitDeclaration",
      "convictedInCourt",
      "membershipProfessionalBody",
    ];

    setForm((prev = {}) => {
      const nextDecl = {
        ...(prev.declaration || {}),
        [name]: yesNoFields.includes(name)
          ? yesNoToBool(value)
          : value,
      };

      // 🔥 CLEAR PROFESSIONAL BODY NAME IF "NO"
      if (name === "membershipProfessionalBody" && value === "No") {
        nextDecl.professionalBodyName = "";
      }

      return {
        ...prev,
        declaration: nextDecl,
      };
    });
  };

  /* DEFAULTS */
  useEffect(() => {
    const defaults = {
      keepOriginalCertificates: true,
      agreeServiceAgreement: true,
      willingToWorkAnyUnit: true,
      agreeOtherTerms: true,
      doYouSmoke: false,
      areYouAlcoholic: false,
      medicallyFitDeclaration: false,
      convictedInCourt: false,
      membershipProfessionalBody: false,
      professionalBodyName: "",
    };

    let changed = false;
    const nextDecl = { ...(form.declaration || {}) };

    Object.keys(defaults).forEach((k) => {
      if (typeof nextDecl[k] === "undefined") {
        nextDecl[k] = defaults[k];
        changed = true;
      }
    });

    if (fullName && (!nextDecl.name || nextDecl.name.trim() === "")) {
      nextDecl.name = fullName;
      nextDecl.signature = fullName;
      changed = true;
    }

    if (changed) {
      setForm((prev = {}) => ({ ...prev, declaration: nextDecl }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName]);

  const handleSubmitClick = () => {
    if (!declaration.date) {
      alert("Please select the declaration date before submitting.");
      return;
    }

    if (
      declaration.membershipProfessionalBody === true &&
      !declaration.professionalBodyName?.trim()
    ) {
      alert("Please enter Professional Body / Organization name.");
      return;
    }

    onSave?.();
    onFinish ? onFinish() : onNext?.();
  };

  const yesNoSelect = (label, name) => (
    <div>
      <label className="label">{label}</label>
      <select
        name={name}
        value={boolToYesNo(declaration[name])}
        onChange={update}
        className="input"
      >
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </div>
  );

  return (
    <section className="card" ref={refs?.declaration} style={{ scrollMarginTop: 80 }}>
      <h3 className="section-title">Declaration</h3>

      <p className="text-gray-700 leading-relaxed mb-6">
        I{" "}
        <span className="font-bold underline">
          {fullName || declaration.name || "__________________"}
        </span>{" "}
        _and I have read and confirm that the information furnished / mentioned herein is 
complete, true, correct and authentic to the best of my knowledge without any discrepancy. In case, the above information is 
found false / incorrect during the course of employment, the management will be fully competent to dismiss my employment 
and same will be deemed to be the part of the contract of employment.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Name</label>
          <input
            name="name"
            value={declaration.name || fullName || ""}
            onChange={update}
            className="input"
          />
        </div>

        <div>
          <label className="label">Date</label>
          <input
            type="date"
            name="date"
            value={declaration.date || ""}
            onChange={update}
            className="input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Signature</label>
          <input
            name="signature"
            value={declaration.signature || fullName || ""}
            onChange={update}
            className="input"
          />
        </div>
      </div>

      <div className="mt-6 border rounded p-4 bg-gray-50">
        <h4 className="font-semibold mb-3">Declarations</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {yesNoSelect("Do you agree to keep your original certificates with the company?", "keepOriginalCertificates")}
          {yesNoSelect("Are you willing to execute service agreement for three years with the company?", "agreeServiceAgreement")}
          {yesNoSelect("Are you willing to work in any of our units?", "willingToWorkAnyUnit")}
          {yesNoSelect("Do you agree for other terms and conditions that the organization enforces from time to time?", "agreeOtherTerms")}
          {yesNoSelect("Do you Smoke?", "doYouSmoke")}
          {yesNoSelect("Are you Alcoholic?", "areYouAlcoholic")}
          {yesNoSelect("On selection, your candidature will be considered only if found medically fit.", "medicallyFitDeclaration")}
          {yesNoSelect("Have you ever been convicted in any court of law?", "convictedInCourt")}
          {yesNoSelect("Are you having membership with any professional body / organization?", "membershipProfessionalBody")}
        </div>

        {/* 🔥 CONDITIONAL PROFESSIONAL BODY NAME */}
        {declaration.membershipProfessionalBody === true && (
          <div className="mt-4">
            <label className="label">
              Professional Body / Organization Name
            </label>
            <input
              name="professionalBodyName"
              value={declaration.professionalBodyName || ""}
              onChange={update}
              className="input"
              placeholder="Enter organization name"
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={onPrev} className="px-5 py-2 border">
          ← Previous
        </button>
        <div className="flex gap-3">
          <button onClick={onSave} className="px-5 py-2 border">
            Save
          </button>
          <button
            onClick={handleSubmitClick}
            className="px-6 py-2 bg-green-600 text-white"
          >
            Submit Form
          </button>
        </div>
      </div>
    </section>
  );
}
