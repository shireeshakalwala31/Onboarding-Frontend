import React, { useEffect, useState } from "react";

/**
 * Office Use Only Section — HR-locked version
 *
 * Props:
 *  - form, setForm, refs
 */

export default function Office({ form, setForm, refs }) {
  const [errors, setErrors] = useState({});
  const office = form.office || {};

  // HR unlock UI state
  const [hrName, setHrName] = useState("");
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(Boolean(office.unlocked));
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  const HR_CODE = process.env.REACT_APP_HR_CODE || "Secret123"; // fallback for dev

  useEffect(() => {
    setUnlocked(Boolean(form?.office?.unlocked));
  }, [form?.office?.unlocked]);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm({ ...form, office: { ...office, [name]: val } });
  };

  const updateOfficePatch = (patch) => {
    setForm({ ...form, office: { ...office, ...patch } });
  };

  const validate = () => {
    const errs = {};
    if (!office.empId || String(office.empId).trim() === "")
      errs.empId = "Employee ID required.";
    if (!office.empName || String(office.empName).trim() === "")
      errs.empName = "Employee name required.";
    if (
      office.doj &&
      !/^\d{4}-\d{2}-\d{2}$/.test(String(office.doj))
    )
      errs.doj = "Date of joining: use YYYY-MM-DD.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePrev = () => {
    if (refs?.family?.current)
      refs.family.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const handleFinish = () => {
    if (!unlocked) {
      setError("Unlock the section before finishing.");
      return;
    }

    if (!validate()) {
      if (refs?.office?.current)
        refs.office.current.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // mark filledBy/filledAt (audit)
    updateOfficePatch({
      filledBy: office.filledBy || office.unlockedBy || hrName || "HR",
      filledAt: office.filledAt || new Date().toISOString(),
    });

    if (refs?.list?.current)
      refs.list.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const handleUnlock = (e) => {
    e?.preventDefault();
    setError("");

    if (lockedUntil && lockedUntil > Date.now()) {
      setError("Too many failed attempts. Try again later.");
      return;
    }

    if (!hrName.trim() || !code) {
      setError("Enter your name and access code.");
      return;
    }

    if (code === HR_CODE) {
      setUnlocked(true);
      updateOfficePatch({
        unlocked: true,
        unlockedBy: hrName.trim(),
        unlockedAt: new Date().toISOString(),
      });
      setAttempts(0);
      setCode("");
      setError("");
    } else {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 5) {
        const until = Date.now() + 30 * 1000; // 30s lockout
        setLockedUntil(until);
        setError("Too many failed attempts. Locked for 30 seconds.");
      } else {
        setError(`Incorrect code (${next}/5).`);
      }
    }
  };

  const handleLock = () => {
    setUnlocked(false);
    updateOfficePatch({
      unlocked: false,
      unlockedBy: null,
      unlockedAt: null,
    });
  };

  return (
    <section
      className="card"
      ref={refs?.office}
      style={{ scrollMarginTop: 80 }}
    >
      {/* <h3 className="section-title">Office Use Only</h3> */}

      {/* Unlock area */}
      {!unlocked ? (
        <form onSubmit={handleUnlock} className="mb-4">
          <p className="mb-3 text-sm text-gray-600">
            Restricted section — only authorised HR/Admin can unlock. Enter
            your name & access code.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <input
              type="text"
              placeholder="Your name (for audit)"
              value={hrName}
              onChange={(e) => setHrName(e.target.value)}
              className="input"
              required
            />

            <input
              type="password"
              placeholder="Access code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input"
              required
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Unlock
              </button>
              <button
                type="button"
                onClick={() => {
                  setHrName("");
                  setCode("");
                  setError("");
                }}
                className="px-3 py-2 border rounded"
              >
                Clear
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 mt-2">{error}</p>}
        </form>
      ) : (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Unlocked by{" "}
            <strong>{office.unlockedBy || hrName || "HR"}</strong>{" "}
            {office.unlockedAt
              ? `on ${new Date(
                  office.unlockedAt
                ).toLocaleString()}`
              : ""}
          </p>

          <button
            onClick={handleLock}
            className="mt-2 px-3 py-1 border rounded text-sm"
            type="button"
          >
            Lock again
          </button>
        </div>
      )}

      {/* 1. Company & employee details */}
      <div className="border rounded p-4 mb-4 bg-gray-50">
        <h4 className="font-semibold mb-3">Basic Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Company Name</label>
            <input
              name="company"
              value={office.company || ""}
              onChange={update}
              className="input"
              placeholder="Company Name"
              disabled={!unlocked}
            />
          </div>

          <div>
            <label className="label">Location</label>
            <input
              name="location"
              value={office.location || ""}
              onChange={update}
              className="input"
              placeholder="Location / Unit"
              disabled={!unlocked}
            />
          </div>

          <div>
            <label className="label">Employee ID No. *</label>
            <input
              name="empId"
              value={office.empId || ""}
              onChange={update}
              className="input"
              disabled={!unlocked}
            />
            {errors.empId && (
              <div className="text-red-600 text-sm mt-1">
                {errors.empId}
              </div>
            )}
          </div>

          <div>
            <label className="label">Employee Name *</label>
            <input
              name="empName"
              value={office.empName || ""}
              onChange={update}
              className="input"
              disabled={!unlocked}
            />
            {errors.empName && (
              <div className="text-red-600 text-sm mt-1">
                {errors.empName}
              </div>
            )}
          </div>

          <div>
            <label className="label">Date of Joining</label>
            <input
              name="doj"
              value={office.doj || ""}
              onChange={update}
              className="input"
              placeholder="YYYY-MM-DD"
              disabled={!unlocked}
            />
            {errors.doj && (
              <div className="text-red-600 text-sm mt-1">
                {errors.doj}
              </div>
            )}
          </div>

          <div>
            <label className="label">Previous Experience (yrs)</label>
            <input
              name="prevExp"
              value={office.prevExp || ""}
              onChange={update}
              className="input"
              placeholder="e.g. 2.5"
              disabled={!unlocked}
            />
          </div>

          <div>
            <label className="label">Department</label>
            <input
              name="dept"
              value={office.dept || ""}
              onChange={update}
              className="input"
              placeholder="Department"
              disabled={!unlocked}
            />
          </div>

          <div>
            <label className="label">Designation</label>
            <input
              name="desig"
              value={office.desig || ""}
              onChange={update}
              className="input"
              placeholder="Designation"
              disabled={!unlocked}
            />
          </div>

          <div>
            <label className="label">Qualification</label>
            <input
              name="qual"
              value={office.qual || ""}
              onChange={update}
              className="input"
              placeholder="Highest Qualification"
              disabled={!unlocked}
            />
          </div>

          <div>
            <label className="label">Grade / Level</label>
            <input
              name="grade"
              value={office.grade || ""}
              onChange={update}
              className="input"
              placeholder="Grade / Level"
              disabled={!unlocked}
            />
          </div>
        </div>
      </div>

      {/* 2. Employment type & salary */}
      <div className="border rounded p-4 mb-4 bg-gray-50">
        <h4 className="font-semibold mb-3">Employment & Salary</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Employment Type</label>
            <select
              name="type"
              value={office.type || ""}
              onChange={update}
              className="input"
              disabled={!unlocked}
            >
              <option value="">Select Type</option>
              <option value="Permanent">Permanent</option>
              <option value="Probation">Probation</option>
              <option value="Trainee">Trainee</option>
              <option value="Consultant">Consultant</option>
              <option value="Retainership">Retainership</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Salary (Label)</label>
            <input
              name="salaryLabel"
              value={office.salaryLabel || "Salary"}
              onChange={update}
              className="input"
              disabled={!unlocked}
            />
          </div>
          <div>
            <label className="label">Gross (PM)</label>
            <input
              name="grossPm"
              value={office.grossPm || ""}
              onChange={update}
              className="input"
              placeholder="Monthly gross"
              disabled={!unlocked}
            />
          </div>
          <div>
            <label className="label">CTC</label>
            <input
              name="ctc"
              value={office.ctc || ""}
              onChange={update}
              className="input"
              placeholder="Annual CTC"
              disabled={!unlocked}
            />
          </div>
        </div>
      </div>

      {/* 3. Reporting officer */}
      <div className="border rounded p-4 mb-4 bg-gray-50">
        <h4 className="font-semibold mb-3">Reporting Officer</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Reporting Officer ID</label>
            <input
              name="reportingOfficerId"
              value={office.reportingOfficerId || ""}
              onChange={update}
              className="input"
              placeholder="Employee ID of reporting officer"
              disabled={!unlocked}
            />
          </div>
          <div>
            <label className="label">Reporting Officer Name</label>
            <input
              name="reportingOfficerName"
              value={office.reportingOfficerName || ""}
              onChange={update}
              className="input"
              placeholder="Name of reporting officer"
              disabled={!unlocked}
            />
          </div>
        </div>
      </div>

      {/* 4. Service agreement, surety, originals */}
      <div className="border rounded p-4 mb-4 bg-gray-50">
        <h4 className="font-semibold mb-3">
          Service Agreement & Originals (tick appropriate)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Service Agreement Bond / Exemption */}
          <div>
            <label className="label">Service Agreement</label>
            <div className="flex flex-col gap-2 mt-1">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="serviceAgreement"
                  value="Bond"
                  checked={office.serviceAgreement === "Bond"}
                  onChange={update}
                  disabled={!unlocked}
                />
                <span>Bond</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="serviceAgreement"
                  value="Exemption"
                  checked={office.serviceAgreement === "Exemption"}
                  onChange={update}
                  disabled={!unlocked}
                />
                <span>Exemption</span>
              </label>
            </div>
          </div>

          {/* Surety Pro of – Yes / No */}
          <div>
            <label className="label">Surety Pro of</label>
            <div className="flex flex-col gap-2 mt-1">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="suretyProOf"
                  value="Yes"
                  checked={office.suretyProOf === "Yes"}
                  onChange={update}
                  disabled={!unlocked}
                />
                <span>Yes</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="suretyProOf"
                  value="No"
                  checked={office.suretyProOf === "No"}
                  onChange={update}
                  disabled={!unlocked}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Original Certificates – Yes / Exemption */}
          <div>
            <label className="label">Original Certificates</label>
            <div className="flex flex-col gap-2 mt-1">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="originalCertificates"
                  value="Yes"
                  checked={office.originalCertificates === "Yes"}
                  onChange={update}
                  disabled={!unlocked}
                />
                <span>Yes</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="originalCertificates"
                  value="Exemption"
                  checked={office.originalCertificates === "Exemption"}
                  onChange={update}
                  disabled={!unlocked}
                />
                <span>Exemption</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Source of recruitment */}
      <div className="border rounded p-4 mb-4 bg-gray-50">
        <h4 className="font-semibold mb-3">
          Source of Recruitment (tick appropriate)
        </h4>
        <div className="flex flex-wrap gap-4">
          {[
            "Direct Placement",
            "Campus",
            "Referral",
            "Any Consultancy",
          ].map((src) => (
            <label
              key={src}
              className="inline-flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="source"
                value={src}
                checked={office.source === src}
                onChange={update}
                disabled={!unlocked}
              />
              <span>{src}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 6. Company assets provided */}
      <div className="border rounded p-4 mb-4 bg-gray-50">
        <h4 className="font-semibold mb-3">Company Assets Provided</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="assetTelRes"
              checked={!!office.assetTelRes}
              onChange={update}
              disabled={!unlocked}
            />
            <span>Tel (Res)</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="assetMobile"
              checked={!!office.assetMobile}
              onChange={update}
              disabled={!unlocked}
            />
            <span>Mobile</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="assetVehicle"
              checked={!!office.assetVehicle}
              onChange={update}
              disabled={!unlocked}
            />
            <span>Vehicle</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="assetFurniture"
              checked={!!office.assetFurniture}
              onChange={update}
              disabled={!unlocked}
            />
            <span>Furniture</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="assetLaptop"
              checked={!!office.assetLaptop}
              onChange={update}
              disabled={!unlocked}
            />
            <span>Laptop</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="assetDesktop"
              checked={!!office.assetDesktop}
              onChange={update}
              disabled={!unlocked}
            />
            <span>Desktop</span>
          </label>
        </div>
      </div>

      {/* 7. Admin remarks + Date & Authorised Signatory */}
      <div className="border rounded p-4 mb-4 bg-gray-50">
        <h4 className="font-semibold mb-3">Approval & Remarks</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              name="approvalDate"
              value={office.approvalDate || ""}
              onChange={update}
              className="input"
              disabled={!unlocked}
            />
          </div>
          <div>
            <label className="label">Authorised Signatory</label>
            <input
              name="authorisedSignatory"
              value={office.authorisedSignatory || ""}
              onChange={update}
              className="input"
              placeholder="Name / signature of authorised signatory"
              disabled={!unlocked}
            />
          </div>
        </div>

        <label className="label">Admin / HR Remarks</label>
        <textarea
          name="adminRemarks"
          value={office.adminRemarks || ""}
          onChange={update}
          className="input"
          placeholder="Office notes, approvals, special conditions, etc."
          rows={3}
          disabled={!unlocked}
        />
      </div>

      {/* Navigation + finish */}
      <div className="mt-6 flex justify-between">
        <button onClick={handlePrev} className="px-5 py-2 rounded border">
          ← Previous: Family
        </button>

        <button
          onClick={handleFinish}
          className="px-6 py-2 rounded bg-green-600 text-white"
          disabled={!unlocked}
        >
          Finish (Go to Employee List)
        </button>
      </div>
    </section>
  );
}
