// src/components/Academic.jsx
import React, { useState, useEffect } from "react";

/**
 * Academic component
 *
 * Props:
 * - form, setForm, refs, onPrev, onSave, onNext
 *
 * onSave will be called with a mapped payload:
 * { draftId, academics: [ { qualification, Specialization, schoolOrCollege, boardOrUniversity,
 *     marks, studyMode, passYear, certificateNo, documentUrl, documentFile, serialNo } ] }
 *
 * Parent should handle documentFile uploads if present.
 */

export default function Academic({ form = {}, setForm, refs = {}, onPrev, onSave, onNext }) {
  const [errors, setErrors] = useState({}); // per-row errors { idx: { field: msg } } + _general
  const rows = form.academics || [];

  // Ensure at least one blank row exists (initialise once)
  useEffect(() => {
    if (!Array.isArray(form.academics) || form.academics.length === 0) {
      setForm((prev = {}) => ({
        ...prev,
        academics: [
          {
            qualification: "",
            Specialization: "",
            schoolOrCollege: "",
            boardOrUniversity: "",
            marks: "",
            studyMode: "",
            passYear: "",
            certificateNo: "",
            documentUrl: "",
            documentFile: null,
          },
        ],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.academics]);

  const addRow = () => {
    const next = [
      ...rows,
      {
        qualification: "",
        Specialization: "",
        schoolOrCollege: "",
        boardOrUniversity: "",
        marks: "",
        studyMode: "",
        passYear: "",
        certificateNo: "",
        documentUrl: "",
        documentFile: null,
      },
    ];
    setForm({ ...form, academics: next });
  };

  const removeRow = (index) => {
    const next = [...rows];
    next.splice(index, 1);
    setForm({ ...form, academics: next });

    // shift errors
    setErrors((prev) => {
      const newErr = {};
      Object.keys(prev).forEach((k) => {
        if (k === "_general") newErr._general = prev._general;
        else {
          const idx = parseInt(k, 10);
          if (!Number.isNaN(idx)) {
            if (idx < index) newErr[idx] = prev[k];
            else if (idx > index) newErr[idx - 1] = prev[k];
          }
        }
      });
      return newErr;
    });
  };

  const updateRow = (index, e) => {
    const { name, value } = e.target;
    const next = [...rows];
    next[index] = { ...next[index], [name]: value };
    setForm({ ...form, academics: next });

    // clear error for that field if present
    setErrors((prev) => {
      const copy = { ...prev };
      if (copy[index] && copy[index][name]) {
        const rowCopy = { ...copy[index] };
        delete rowCopy[name];
        if (Object.keys(rowCopy).length === 0) {
          delete copy[index];
        } else {
          copy[index] = rowCopy;
        }
      }
      return copy;
    });
  };

  const updateFile = (index, e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    const next = [...rows];
    next[index] = {
      ...next[index],
      documentFile: file,
      // documentUrl holds filename for display / backend reference — parent can replace with uploaded URL
      documentUrl: file ? file.name : (next[index].documentUrl || ""),
    };
    setForm({ ...form, academics: next });

    // clear any documentUrl error if present
    setErrors((prev) => {
      const copy = { ...prev };
      if (copy[index] && copy[index].documentUrl) {
        const rowCopy = { ...copy[index] };
        delete rowCopy.documentUrl;
        if (Object.keys(rowCopy).length === 0) delete copy[index];
        else copy[index] = rowCopy;
      }
      return copy;
    });
  };

  const validateAll = () => {
    const newErrors = {};
    if (!rows || rows.length === 0) {
      newErrors._general = "Add at least one academic record.";
      setErrors(newErrors);
      return false;
    }

    rows.forEach((r, i) => {
      const rowErr = {};
      const qualification = (r.qualification || "").toString().trim();
      const schoolOrCollege = (r.schoolOrCollege || r.school || "").toString().trim();
      const boardOrUniversity = (r.boardOrUniversity || r.board || "").toString().trim();
      const passYear = (r.passYear || "").toString().trim();

      if (!qualification) rowErr.qualification = "Qualification required.";
      if (!schoolOrCollege) rowErr.schoolOrCollege = "School/College required.";
      if (!boardOrUniversity) rowErr.boardOrUniversity = "Board / University required.";
      if (!passYear) rowErr.passYear = "Year of passing required.";
      else if (!/^\d{4}$/.test(passYear)) rowErr.passYear = "Enter year as YYYY.";

      if (Object.keys(rowErr).length > 0) newErrors[i] = rowErr;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapPayload = () => {
    const draftId = localStorage.getItem("draftId") || form.draftId || "";
    const academics = (rows || []).map((r, i) => {
      // Accept both frontend names `school` and `schoolOrCollege` to be safe
      const schoolOrCollege = (r.schoolOrCollege || r.school || "").toString().trim();
      return {
        draftId,
        serialNo: i + 1,
        qualification: (r.qualification || "").toString().trim(),
        Specialization: (r.Specialization || r.subject || "").toString().trim(),
        schoolOrCollege,
        boardOrUniversity: (r.boardOrUniversity || r.board || r.university || "").toString().trim(),
        marks: (r.marks || "").toString().trim(),
        // studyMode will be one of: "Full-time", "Part-time", "Distance" or empty string
        studyMode: (r.studyMode || r.type || "").toString().trim(),
        passYear: (r.passYear || "").toString().trim(),
        certificateNo: (r.certificateNo || "").toString().trim(),
        // documentUrl stores filename or URL; documentFile contains File object (if uploaded)
        documentUrl: (r.documentUrl || "").toString().trim(),
        documentFile: r.documentFile || null,
      };
    });

    return { draftId, academics };
  };

  const handleSaveClick = async () => {
    const mapped = mapPayload();

    // update parent's form.academics to canonical keys (optional)
    setForm((prev) => ({ ...prev, academics: mapped.academics }));

    // debug
    // eslint-disable-next-line no-console
    console.log("Academic mapped payload ->", mapped);

    if (typeof onSave === "function") {
      try {
        // prefer passing mapped payload into parent
        const maybe = onSave(mapped);
        // if parent returns a promise, await it
        if (maybe && typeof maybe.then === "function") await maybe;
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Failed to save";
        window.alert(msg);
        throw err;
      }
    }
  };

  const handleNextClick = async () => {
    const ok = validateAll();
    if (!ok) {
      if (refs?.academic?.current) refs.academic.current.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (typeof onSave === "function") {
      try {
        await handleSaveClick();
      } catch (err) {
        if (refs?.academic?.current) refs.academic.current.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    if (typeof onNext === "function") onNext();
  };

  const handlePrevClick = () => {
    if (typeof onPrev === "function") onPrev();
  };

  return (
    <section className="card" ref={refs?.academic} style={{ scrollMarginTop: 80 }}>
      <h3 className="section-title">Academic Information</h3>

      <p className="text-sm text-gray-600 mb-4">
        Please add academic qualifications from Secondary onwards. Attach copies when submitting.
      </p>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">Records: {(rows || []).length}</div>
          <button type="button" onClick={addRow} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
            + Add Row
          </button>
        </div>

        {errors._general && <div className="text-red-600 text-sm mb-2">{errors._general}</div>}

        {(rows || []).map((r, idx) => (
          <div key={idx} className="border rounded p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Qualification */}
              <div>
                <label className="label">Qualification *</label>
                <input
                  name="qualification"
                  value={r.qualification || ""}
                  onChange={(e) => updateRow(idx, e)}
                  className="input"
                  placeholder="e.g. Secondary, B.Tech, MBA"
                />
                {errors[idx]?.qualification && <div className="text-red-600 text-sm mt-1">{errors[idx].qualification}</div>}
              </div>

              {/* Specialization */}
              <div>
                <label className="label">Subject / Specialization</label>
                <input
                  name="Specialization"
                  value={r.Specialization || r.subject || ""}
                  onChange={(e) => updateRow(idx, e)}
                  className="input"
                  placeholder="e.g. Computer Science"
                />
              </div>

              {/* School / College */}
              <div>
                <label className="label">School / College *</label>
                <input
                  name="schoolOrCollege"
                  value={r.schoolOrCollege || r.school || ""}
                  onChange={(e) => updateRow(idx, e)}
                  className="input"
                  placeholder="Institute name"
                />
                {errors[idx]?.schoolOrCollege && <div className="text-red-600 text-sm mt-1">{errors[idx].schoolOrCollege}</div>}
              </div>

              {/* Board / University */}
              <div>
                <label className="label">Board / University *</label>
                <input
                  name="boardOrUniversity"
                  value={r.boardOrUniversity || ""}
                  onChange={(e) => updateRow(idx, e)}
                  className="input"
                  placeholder="Board or University"
                />
                {errors[idx]?.boardOrUniversity && <div className="text-red-600 text-sm mt-1">{errors[idx].boardOrUniversity}</div>}
              </div>

              {/* Marks */}
              <div>
                <label className="label">Marks / %</label>
                <input name="marks" value={r.marks || ""} onChange={(e) => updateRow(idx, e)} className="input" placeholder="e.g. 85%" />
              </div>

              {/* Study Mode (select) */}
              <div>
                <label className="label">Study Mode</label>
                <select name="studyMode" value={r.studyMode || r.type || ""} onChange={(e) => updateRow(idx, e)} className="input">
                  <option value="">Select mode</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Distance">Distance</option>
                </select>
              </div>

              {/* Year of Passing */}
              <div>
                <label className="label">Year of Passing *</label>
                <input name="passYear" value={r.passYear || ""} onChange={(e) => updateRow(idx, e)} className="input" placeholder="YYYY" />
                {errors[idx]?.passYear && <div className="text-red-600 text-sm mt-1">{errors[idx].passYear}</div>}
              </div>

              {/* Certificate No */}
              <div>
                <label className="label">Certificate No</label>
                <input name="certificateNo" value={r.certificateNo || ""} onChange={(e) => updateRow(idx, e)} className="input" placeholder="Certificate number (optional)" />
              </div>

              {/* Document Upload */}
              <div>
                <label className="label">Document (upload)</label>
                <input
                  type="file"
                  name="documentFile"
                  onChange={(e) => updateFile(idx, e)}
                  className="input"
                  accept=".pdf,image/*"
                />
                {/* show filename (if selected) */}
                {r.documentFile ? (
                  <div className="text-sm mt-1">{r.documentFile.name}</div>
                ) : r.documentUrl ? (
                  <div className="text-sm mt-1">{r.documentUrl}</div>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-3">
              <button type="button" onClick={() => removeRow(idx)} className="px-3 py-1 rounded bg-red-600 text-white">
                Remove Row
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-between items-center">
        <button type="button" onClick={handlePrevClick} className="px-5 py-2 rounded border">
          ← Previous
        </button>

        <div className="flex gap-3">
          <button type="button" onClick={handleSaveClick} className="px-5 py-2 rounded border">
            Save
          </button>

          <button type="button" onClick={handleNextClick} className="px-6 py-2 rounded bg-blue-600 text-white">
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}
