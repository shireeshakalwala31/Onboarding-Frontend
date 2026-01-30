// src/components/Family.jsx
import React, { useEffect } from "react";

export default function Family({
  form = {},
  setForm,
  refs = {},
  onPrev,
  onSave,
  onNext,
}) {
  const rows = Array.isArray(form.family) ? form.family : [];

  // ensure at least one blank row
  useEffect(() => {
    if (!Array.isArray(form.family) || form.family.length === 0) {
      setForm((prev = {}) => ({
        ...prev,
        family: [{ name: "", relation: "", dob: "", blood: "", occupation: "" }],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.family]);

  const addRow = () => {
    const next = [...rows, { name: "", relation: "", dob: "", blood: "", occupation: "" }];
    setForm((prev = {}) => ({ ...prev, family: next }));
  };

  const removeRow = (index) => {
    const next = [...rows];
    next.splice(index, 1);
    setForm((prev = {}) => ({ ...prev, family: next }));
  };

  const updateRow = (index, e) => {
    const { name, value } = e.target;
    const next = [...rows];
    next[index] = { ...next[index], [name]: value };
    setForm((prev = {}) => ({ ...prev, family: next }));
  };

  const handlePrevClick = () => {
    if (typeof onPrev === "function") onPrev();
  };

  const handleSaveClick = () => {
    if (typeof onSave === "function") onSave();
  };

  const handleNextClick = () => {
    // minimal validation: ensure at least one row with name & relation
    if (!rows.length || !rows.some((r) => r.name && r.relation)) {
      window.alert("Add at least one family member with name and relation.");
      if (refs?.family?.current) refs.family.current.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (typeof onSave === "function") onSave();
    if (typeof onNext === "function") onNext();
  };

  return (
    <section className="card" ref={refs?.family} style={{ scrollMarginTop: 80 }}>
      <h3 className="section-title">Family Members Information</h3>

      <p className="text-sm text-gray-600 mb-4">Add details of immediate family members. Minimum one entry required.</p>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>Records: {rows.length}</div>
          <button type="button" onClick={addRow} className="px-3 py-1 rounded bg-blue-600 text-white">+ Add Row</button>
        </div>

        {(rows || []).map((r, idx) => (
          <div key={idx} className="border rounded p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="label">Name</label>
                <input name="name" value={r.name || ""} onChange={(e) => updateRow(idx, e)} className="input" placeholder="Name" />
              </div>

              <div>
                <label className="label">Relationship</label>
                <input name="relation" value={r.relation || ""} onChange={(e) => updateRow(idx, e)} className="input" placeholder="Relation" />
              </div>

              <div>
                <label className="label">DOB / Age</label>
                <input name="dob" value={r.dob || ""} onChange={(e) => updateRow(idx, e)} className="input" placeholder="YYYY-MM-DD or Age" />
              </div>

              <div>
                <label className="label">Blood Group</label>
                <input name="blood" value={r.blood || ""} onChange={(e) => updateRow(idx, e)} className="input" placeholder="A+, O- etc." />
              </div>

              <div>
                <label className="label">Occupation</label>
                <input name="occupation" value={r.occupation || ""} onChange={(e) => updateRow(idx, e)} className="input" placeholder="Occupation" />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button type="button" onClick={() => removeRow(idx)} className="px-3 py-1 rounded bg-red-600 text-white">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between items-center">
        <button type="button" onClick={handlePrevClick} className="px-5 py-2 rounded border">← Previous</button>

        <div className="flex gap-3">
          <button type="button" onClick={handleSaveClick} className="px-5 py-2 rounded border">Save</button>

          <button type="button" onClick={handleNextClick} className="px-6 py-2 rounded bg-blue-600 text-white">Next →</button>
        </div>
      </div>
    </section>
  );
}
