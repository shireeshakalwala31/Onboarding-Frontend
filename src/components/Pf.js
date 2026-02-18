// src/components/PF.jsx
import React, { useEffect, useState } from "react";

/**
 * PF / UAN Section
 *
 * - UI unchanged
 * - produce payload exactly matching backend field names used in syncPFInfo
 *
 * Backend expects:
 * draftId, pfAction, uanNumber, existingPfNumber, bankAccountNumber, bankName,
 * ifscCode, passportNumber, passportValidity, placeOfIssue,
 * languagesKnown, motherTongue, identificationMark1, identificationMark2,
 * mobileNumber, email
 */

export default function PF({ form = {}, setForm, refs = {}, onPrev, onSave, onNext }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const defaultPF = {
    pfAction: "",
    uan: "",
    pfNumber: "",
    mobile: "",
    bankAcc: "",
    bankName: "",
    ifsc: "",
    passport: "",
    validity: "",
    issuePlace: "",
    languages: "",
    motherTongue: "",
    idMark1: "",
    idMark2: "",
    email: "",
  };

  // Ensure form.pf has all expected keys (run once)
  useEffect(() => {
    const current = form.pf || {};
    let changed = false;
    const merged = { ...defaultPF };
    Object.keys(merged).forEach((k) => {
      if (current && typeof current[k] !== "undefined" && current[k] !== null) {
        merged[k] = current[k];
      } else {
        if (!current || typeof current[k] === "undefined") changed = true;
      }
    });
    if (changed) setForm({ ...form, pf: merged });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pf = (form && form.pf) || defaultPF;

  useEffect(() => {
    setErrors((prev) => {
      const next = { ...prev };
      if (pf.mobile) delete next.mobile;
      if (pf.ifsc) delete next.ifsc;
      if (pf.uan) delete next.uan;
      if (pf.email) delete next.email;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pf.mobile, pf.ifsc, pf.uan, pf.email]);

  const update = (e) => {
    let { name, value } = e.target;

    // numeric-only for some fields
    if (name === "mobile" || name === "uan" || name === "bankAcc") {
      value = value.replace(/[^0-9]/g, "");
    }

    if (name === "mobile") value = value.slice(0, 10);
    if (name === "uan") value = value.slice(0, 12);
    if (name === "bankAcc") value = value.slice(0, 20);

    // IFSC show uppercase without spaces
    if (name === "ifsc") value = value.toUpperCase().replace(/\s+/g, "");

    setForm({ ...form, pf: { ...(form.pf || {}), [name]: value } });
  };

  const validate = () => {
    const newErrors = {};

    if (!pf.mobile || String(pf.mobile).trim().length === 0) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(String(pf.mobile))) {
      newErrors.mobile = "Enter a valid 10 digit mobile number starting with 6-9.";
    }

    if (pf.uan && !/^\d{12}$/.test(String(pf.uan))) {
      newErrors.uan = "UAN must be 12 digits.";
    }

    if (pf.pfAction === "transfer" && (!pf.uan || !/^\d{12}$/.test(String(pf.uan)))) {
      newErrors.uan = "For PF transfer, UAN must be 12 digits.";
    }

    if (pf.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(pf.ifsc))) {
      newErrors.ifsc = "IFSC looks invalid (Format: AAAA0XXXXXX).";
    }

    if (pf.passport && !/^[A-Z0-9]{6,9}$/i.test(String(pf.passport).replace(/\s+/g, ""))) {
      newErrors.passport = "Passport number looks invalid.";
    }

    if (pf.validity && !/^\d{4}-\d{2}-\d{2}$/.test(String(pf.validity))) {
      newErrors.validity = "Passport validity should be YYYY-MM-DD.";
    }

    if (pf.email && !/^\S+@\S+\.\S+$/.test(String(pf.email))) {
      newErrors.email = "Invalid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Build payload matching backend expected field names
  const buildMapped = () => {
    // Get draftId from localStorage for proper record identification
    const draftId = localStorage.getItem("draftId") || "";

    return {
      draftId: draftId,
      pfAction: pf.pfAction || "",

      // sensitive fields
      uanNumber: pf.uan ? String(pf.uan).trim() : null,
      existingPfNumber: pf.pfNumber ? String(pf.pfNumber).trim() : null,

      // banking
      bankAccountNumber: pf.bankAcc ? String(pf.bankAcc).trim() : null,
      bankName: pf.bankName ? String(pf.bankName).trim() : "",
      ifscCode: pf.ifsc ? String(pf.ifsc).replace(/\s+/g, "").toUpperCase() : "",

      // passport
      passportNumber: pf.passport ? String(pf.passport).trim() : null,
      passportValidity: pf.validity ? String(pf.validity).trim() : "",
      placeOfIssue: pf.issuePlace ? String(pf.issuePlace).trim() : "",

      // language & id marks -> backend fields: languages (array) in schema, but controller expects languagesKnown input
      // your controller transforms languagesKnown to schema key 'languages', so send languagesKnown.
      languagesKnown: pf.languages
        ? Array.isArray(pf.languages)
          ? pf.languages
          : String(pf.languages).split(",").map((s) => s.trim()).filter(Boolean)
        : [],

      motherTongue: pf.motherTongue ? String(pf.motherTongue).trim() : "",

      // identification marks - controller expects identificationMark1/2
      identificationMark1: pf.idMark1 ? String(pf.idMark1).trim() : "",
      identificationMark2: pf.idMark2 ? String(pf.idMark2).trim() : "",

      // contact - mobile is required, but don't send email here as it's already saved in Personal section
      // sending email again can cause duplicate key errors if backend uses INSERT instead of UPDATE
      mobileNumber: pf.mobile ? String(pf.mobile).trim() : ""
    };
  };

  const handleSaveClick = () => {
    const mapped = buildMapped();

    // keep parent's form.pf up to date
    setForm({ ...form, pf: { ...(form.pf || {}), ...pf } });

    // debug: check mapped payload in console & Network tab
    // eslint-disable-next-line no-console
    console.log("PF mapped payload ->", mapped);

    // prefer to pass mapped payload to parent saver
    if (typeof onSave === "function") {
      try {
        const ret = onSave(mapped);
        return ret;
      } catch (err) {
        // parent might not accept args — fallback to calling it without arguments
        try {
          onSave();
        } catch (e) {
          // swallow
          // eslint-disable-next-line no-console
          console.warn("onSave failed in PF component", e);
        }
      }
    }
  };

  const handleNextClick = () => {
    setTouched((t) => ({
      ...t,
      mobile: true,
      ifsc: true,
      uan: true,
      email: true,
    }));

    const ok = validate();
    if (!ok) {
      if (refs?.pf?.current) refs.pf.current.scrollIntoView({ behavior: "smooth" });
      return;
    }

    try {
      handleSaveClick();
    } catch (err) {
      // ignore
    }

    if (typeof onNext === "function") onNext();
  };

  const handlePrevClick = () => {
    if (typeof onPrev === "function") onPrev();
  };

  return (
    <section className="card" ref={refs?.pf} style={{ scrollMarginTop: 80 }}>
      <h3 className="section-title">PF / UAN & Passport / Bank Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PF Action */}
        <div>
          <label className="label">What would you like to do with previous PF?</label>
          <select name="pfAction" value={pf.pfAction || ""} onChange={update} className="input">
            <option value="">Select action</option>
            <option value="transfer">Transfer</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </div>

        {/* Existing UAN */}
        <div>
          <label className="label">Existing UAN Number</label>
          <input
            name="uan"
            value={pf.uan || ""}
            onChange={(e) => {
              update(e);
              setTouched((t) => ({ ...t, uan: true }));
            }}
            placeholder="UAN (12 digits, if available)"
            className="input"
            maxLength={12}
          />
          {touched.uan && errors.uan && <div className="text-red-600 text-sm mt-1">{errors.uan}</div>}
        </div>

        {/* Existing PF Number */}
        <div>
          <label className="label">Existing PF Number</label>
          <input name="pfNumber" value={pf.pfNumber || ""} onChange={update} placeholder="Previous PF number (optional)" className="input" />
        </div>

        {/* Mobile */}
        <div>
          <label className="label">Mobile Number *</label>
          <input
            name="mobile"
            value={pf.mobile || ""}
            onChange={(e) => {
              update(e);
              setTouched((t) => ({ ...t, mobile: true }));
            }}
            placeholder="10 digit mobile number"
            className="input"
            maxLength={10}
          />
          {touched.mobile && errors.mobile && <div className="text-red-600 text-sm mt-1">{errors.mobile}</div>}
        </div>

        {/* Bank Account */}
        <div>
          <label className="label">Bank Account Number</label>
          <input name="bankAcc" value={pf.bankAcc || ""} onChange={update} placeholder="Numeric account number" className="input" maxLength={20} />
        </div>

        {/* Bank Name */}
        <div>
          <label className="label">Bank Name</label>
          <input name="bankName" value={pf.bankName || ""} onChange={update} placeholder="Bank name" className="input" />
        </div>

        {/* IFSC */}
        <div>
          <label className="label">IFSC Code</label>
          <input
            name="ifsc"
            value={pf.ifsc || ""}
            onChange={(e) => {
              update(e);
              setTouched((t) => ({ ...t, ifsc: true }));
            }}
            placeholder="AAAA0XXXXXX"
            className="input"
            maxLength={11}
          />
          {touched.ifsc && errors.ifsc && <div className="text-red-600 text-sm mt-1">{errors.ifsc}</div>}
        </div>

        {/* Passport Number */}
        <div>
          <label className="label">Passport Number</label>
          <input name="passport" value={pf.passport || ""} onChange={update} placeholder="Passport number (if any)" className="input" />
          {touched.passport && errors.passport && <div className="text-red-600 text-sm mt-1">{errors.passport}</div>}
        </div>

        {/* Place of Issue */}
        <div>
          <label className="label">Place of Issue</label>
          <input name="issuePlace" value={pf.issuePlace || ""} onChange={update} placeholder="Place of issue" className="input" />
        </div>

        {/* Validity */}
        <div>
          <label className="label">Passport Validity</label>
          <input name="validity" value={pf.validity || ""} onChange={update} placeholder="YYYY-MM-DD" className="input" />
          {touched.validity && errors.validity && <div className="text-red-600 text-sm mt-1">{errors.validity}</div>}
        </div>

        {/* Email */}
        <div>
          <label className="label">Email Address</label>
          <input
            name="email"
            value={pf.email || ""}
            onChange={(e) => {
              update(e);
              setTouched((t) => ({ ...t, email: true }));
            }}
            placeholder="you@example.com"
            className="input"
          />
          {touched.email && errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
        </div>

        {/* Languages Known (comma separated) */}
        <div className="md:col-span-2">
          <label className="label">Languages Known</label>
          <input name="languages" value={pf.languages || ""} onChange={update} placeholder="English, Hindi, Telugu, ..." className="input" />
        </div>

        {/* Mother Tongue */}
        <div>
          <label className="label">Mother Tongue</label>
          <input name="motherTongue" value={pf.motherTongue || ""} onChange={update} placeholder="Mother tongue" className="input" />
        </div>

        {/* Identification marks */}
        <div>
          <label className="label">Identification Mark 1</label>
          <input name="idMark1" value={pf.idMark1 || ""} onChange={update} placeholder="Identification mark 1" className="input" />
        </div>

        <div>
          <label className="label">Identification Mark 2</label>
          <input name="idMark2" value={pf.idMark2 || ""} onChange={update} placeholder="Identification mark 2" className="input" />
        </div>
      </div>

      {/* Navigation Buttons */}
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
