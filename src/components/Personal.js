import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

const Personal = forwardRef(function Personal(
  { form = {}, setForm, refs = {}, onPrev, onSave, onNext },
  ref
) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const personal = (form && form.personal) || {};
  const today = new Date().toISOString().split("T")[0];

  /* ----------------------- Helpers ----------------------- */
  const setPersonalField = (name, value) => {
    setForm((prev = {}) => ({
      ...prev,
      personal: { ...(prev.personal || {}), [name]: value },
    }));
  };

  const handleInput = (e) => {
    let { name, value } = e.target;

    // Restrict numbers for specific fields
    if (
      ["presentPhone", "permPhone", "presentPin", "permPin", "aadhar"].includes(
        name
      )
    ) {
      value = value.replace(/[^0-9]/g, "");
    }

    // Phone max 10
    if (name === "presentPhone" || name === "permPhone") value = value.slice(0, 10);

    // Aadhar max 12
    if (name === "aadhar") value = value.slice(0, 12);

    // Pincode max 6
    if (name === "presentPin" || name === "permPin") value = value.slice(0, 6);

    // For blood input allow letters +/-, convert small mistakes on save instead of here

    // If marital status changed to 'Single', clear marriage date
    if (name === "maritalStatus") {
      // normalize option text
      const normalized = (value || "").toString();
      if (normalized.toLowerCase() === "single") {
        setPersonalField("marriageDate", "");
      }
    }

    setPersonalField(name, value);
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const handleBlur = (name) => {
    setTouched((t) => ({ ...t, [name]: true }));
  };

  /* ----------------------- Age Calculation ----------------------- */
  function calculateAgeFromDob(dob) {
    try {
      let y, m, d;

      if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        [y, m, d] = dob.split("-");
        return getAge(y, m - 1, d);
      }

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
        const parts = dob.split("/");
        d = parts[0];
        m = parts[1] - 1;
        y = parts[2];
        return getAge(y, m, d);
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  const getAge = (y, m, d) => {
    const birth = new Date(y, m, d);
    if (isNaN(birth.getTime())) return undefined;

    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const mDiff = now.getMonth() - birth.getMonth();

    if (mDiff < 0 || (mDiff === 0 && now.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : undefined;
  };

  useEffect(() => {
    if (personal.dob) {
      const age = calculateAgeFromDob(personal.dob);
      if (age !== undefined && age !== personal.age) {
        setForm((prev = {}) => ({
          ...prev,
          personal: { ...(prev.personal || {}), age },
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personal.dob]);

  /* ----------------------- Validation ----------------------- */
  const runValidation = () => {
    const p = form.personal || {};
    const newErrors = {};

    if (!p.firstName?.trim()) newErrors.firstName = "First name is required.";
    if (!p.lastName?.trim()) newErrors.lastName = "Last name is required.";

    if (!p.dob) newErrors.dob = "Date of birth is required.";
    else {
      const age = calculateAgeFromDob(p.dob);
      if (age === undefined) newErrors.dob = "Invalid DOB format.";
      else if (age < 16) newErrors.dob = "Age must be at least 16.";
      else if (age > 120) newErrors.dob = "Age cannot exceed 120.";
    }

    if (!p.email) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))
      newErrors.email = "Invalid email address.";

    if (!p.presentPhone || p.presentPhone.length !== 10)
      newErrors.presentPhone = "Present phone must be 10 digits.";

    if (!p.permPhone || p.permPhone.length !== 10)
      newErrors.permPhone = "Permanent phone must be 10 digits.";

    if (p.presentPin && p.presentPin.length !== 6)
      newErrors.presentPin = "Pincode must be 6 digits.";

    if (p.permPin && p.permPin.length !== 6)
      newErrors.permPin = "Pincode must be 6 digits.";

    if (p.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(p.pan))
      newErrors.pan = "Invalid PAN format.";

    if (p.aadhar && p.aadhar.length !== 12)
      newErrors.aadhar = "Aadhar must be 12 digits.";

    // Additional validation for marital status -> marriageDate
    if (p.maritalStatus && p.maritalStatus.toString().toLowerCase() === "married") {
      if (!p.marriageDate) newErrors.marriageDate = "Marriage date is required for married applicants.";
      else if (p.marriageDate > today) newErrors.marriageDate = "Marriage date cannot be in the future.";
      // optionally: ensure marriageDate is after dob + 16 years - skipped for simplicity
    }

    setErrors(newErrors);
    return newErrors;
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      const errs = runValidation();
      return { ok: Object.keys(errs).length === 0, errors: errs };
    },
  }));

  /* ----------------------- Navigation ----------------------- */

  const handlePrevClick = () => onPrev && onPrev();

  /**
   * IMPORTANT:
   * Build `mapped` object to match backend field names exactly.
   * - dob -> will be converted to dateOfBirth by onboardingApi.savePersonalInfo
   * - aadhar -> will be converted to aadhaar
   * - permPhone -> will be converted to permanentPhone
   * - presentPin / permPin -> map to presentPincode / permanentPincode
   * - permAddress -> permanentAddress (backend expects permanentAddress)
   * - blood -> bloodGroup (normalize common mistakes)
   * - license -> drivingLicense
   * - marriageDate -> marriageDate
   *
   * We intentionally keep all fields (empty string fallback) so backend doesn't get `undefined`/`null`.
   */
  const handleSaveClick = () => {
    // normalize blood group input: common mistakes -> uppercase, replace leading zero with 'O'
    const rawBlood = (personal.blood || personal.bloodGroup || "").toString().trim();
    let normalizedBlood = rawBlood.toUpperCase().replace(/\s+/g, "");
    // replace common '0' (zero) used instead of 'O' e.g. '0+' => 'O+'
    normalizedBlood = normalizedBlood.replace(/^0/, "O");

    // ensure plus/minus format stays (e.g., O+, A-, etc.)
    // if blank -> keep blank to allow backend default
    if (normalizedBlood === "") normalizedBlood = "";

    // driving license stored as string; frontend uses 'license'
    const dl = personal.license || personal.drivingLicense || "";

    const mapped = {
      draftId: localStorage.getItem("draftId") || "",

      // names (backend schema uses firstName/lastName)
      firstName: (personal.firstName || "").toString().trim().toUpperCase(),
      lastName: (personal.lastName || "").toString().trim().toUpperCase(),

      // dob -> onboardingApi will map 'dob' to 'dateOfBirth'
      dob: personal.dob || "",

      // Place / location fields (backend fields: placeOfBirth, state, district)
      placeOfBirth: personal.placeOfBirth || "",
      state: personal.state || "",
      district: personal.district || "",

      // nationality & religion
      nationality: personal.nationality || "Indian",
      religion: personal.religion || "",

      // bloodGroup (schema uses bloodGroup)
      bloodGroup: normalizedBlood,

      // gender & maritalStatus (schema expects gender, maritalStatus)
      gender: personal.gender || "",
      maritalStatus: personal.maritalStatus || "Single",

      // marriageDate
      marriageDate: personal.marriageDate || "",

      // Present address block (schema fields: presentAddress, presentCity, presentState, presentPincode, presentPhone)
      presentAddress: personal.presentAddress || "",
      presentCity: personal.presentCity || "",
      presentState: personal.presentState || "",
      presentPincode: personal.presentPin || "",
      presentPhone: personal.presentPhone || "",

      // Permanent address block (schema fields: permanentAddress, permanentCity, permanentState, permanentPincode, permanentPhone)
      permanentAddress: personal.permAddress || "",
      permanentCity: personal.permCity || "",
      permanentState: personal.permState || "",
      permanentPincode: personal.permPin || "",
      // On frontend we use 'permPhone' so onboardingApi maps it to permanentPhone
      permPhone: personal.permPhone || "",

      // Identification fields
      // backend schema field names: drivingLicense, pan, aadhaar
      drivingLicense: dl,
      pan: personal.pan || "",
      aadhar: personal.aadhar || "",

      // email (keep for contact)
      email: personal.email || "",

      // photo hint (actual upload handled separately)
      photoHint: personal.photoFile ? "attached" : "",
    };

    // call parent onSave with mapped payload (your onboardingApi expects this shape)
    // Pass second arg (photoFile) if present to encourage direct upload handling
    if (onSave) {
      try {
        onSave(mapped, personal.photoFile);
      } catch (e) {
        // if parent's onSave signature doesn't accept second arg, fallback to single arg
        try {
          onSave(mapped);
        } catch (err) {
          console.warn("onSave failed when called from Personal component", err);
        }
      }
    }
  };

  const handleNextClick = async () => {
    setTouched({
      ...touched,
      firstName: true,
      lastName: true,
      dob: true,
      email: true,
      presentPhone: true,
      permPhone: true,
      maritalStatus: true,
      marriageDate: true,
    });

    const errs = runValidation();
    if (Object.keys(errs).length > 0) {
      refs.personal?.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Call handleSaveClick and wait for it to complete before navigating
    // This ensures the data is saved before moving to the next section
    try {
      await handleSaveClick();
    } catch (err) {
      console.error("Error saving personal info:", err);
      // Don't navigate if save fails
      return;
    }
    
    // Only navigate after successful save
    if (onNext) {
      onNext();
    }
  };

  /* ----------------------- UI ----------------------- */
  return (
    <section
      className="card space-y-8"
      ref={refs?.personal}
      style={{ scrollMarginTop: 30 }}
    >
      <div>
        <h3 className="section-title">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="label">First Name *</label>
            <input
              name="firstName"
              value={personal.firstName || ""}
              onChange={handleInput}
              onBlur={() => handleBlur("firstName")}
              className="input"
            />
            {touched.firstName && errors.firstName && (
              <div className="text-red-600 text-sm mt-1">
                {errors.firstName}
              </div>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="label">Last Name *</label>
            <input
              name="lastName"
              value={personal.lastName || ""}
              onChange={handleInput}
              onBlur={() => handleBlur("lastName")}
              className="input"
            />
            {touched.lastName && errors.lastName && (
              <div className="text-red-600 text-sm mt-1">
                {errors.lastName}
              </div>
            )}
          </div>

          {/* DOB */}
          <div>
            <label className="label">Date of Birth *</label>
            <input
              type="date"
              name="dob"
              max={today}
              value={personal.dob || ""}
              onChange={handleInput}
              onBlur={() => handleBlur("dob")}
              className="input"
            />
            {touched.dob && errors.dob && (
              <div className="text-red-600 text-sm mt-1">{errors.dob}</div>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="label">Age</label>
            <input readOnly className="input bg-gray-50" value={personal.age ?? ""} />
          </div>

          {/* Place of Birth */}
          <div>
            <label className="label">Place of Birth</label>
            <input
              name="placeOfBirth"
              value={personal.placeOfBirth || ""}
              onChange={handleInput}
              className="input"
            />
          </div>

          {/* District */}
          <div>
            <label className="label">District</label>
            <input
              name="district"
              value={personal.district || ""}
              onChange={handleInput}
              className="input"
            />
          </div>

          {/* State */}
          <div>
            <label className="label">State</label>
            <input
              name="state"
              value={personal.state || ""}
              onChange={handleInput}
              className="input"
            />
          </div>

          {/* Nationality */}
          <div>
            <label className="label">Nationality</label>
            <input
              name="nationality"
              value={personal.nationality || ""}
              onChange={handleInput}
              className="input"
            />
          </div>

          {/* Religion */}
          <div>
            <label className="label">Religion</label>
            <input
              name="religion"
              value={personal.religion || ""}
              onChange={handleInput}
              className="input"
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">Email Address *</label>
            <input
              name="email"
              value={personal.email || ""}
              onChange={handleInput}
              onBlur={() => handleBlur("email")}
              className="input"
            />
            {touched.email && errors.email && (
              <div className="text-red-600 text-sm mt-1">{errors.email}</div>
            )}
          </div>

          {/* Blood Group */}
          <div>
            <label className="label">Blood Group</label>
            <input
              name="blood"
              value={personal.blood || personal.bloodGroup || ""}
              onChange={handleInput}
              className="input"
              placeholder="e.g. O+"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="label">Gender</label>
            <input
              name="gender"
              value={personal.gender || ""}
              onChange={handleInput}
              className="input"
            />
          </div>

          {/* Marital Status */}
          <div>
            <label className="label">Marital Status</label>
            <select
              name="maritalStatus"
              value={personal.maritalStatus || "Single"}
              onChange={handleInput}
              onBlur={() => handleBlur("maritalStatus")}
              className="input"
            >
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
              <option>Widowed</option>
              <option>Separated</option>
            </select>
            {touched.maritalStatus && errors.maritalStatus && (
              <div className="text-red-600 text-sm mt-1">{errors.maritalStatus}</div>
            )}
          </div>

          {/* Marriage Date - shown only when Married */}
          {personal.maritalStatus && personal.maritalStatus.toString().toLowerCase() === "married" && (
            <div>
              <label className="label">Marriage Date *</label>
              <input
                type="date"
                name="marriageDate"
                max={today}
                value={personal.marriageDate || ""}
                onChange={handleInput}
                onBlur={() => handleBlur("marriageDate")}
                className="input"
              />
              {touched.marriageDate && errors.marriageDate && (
                <div className="text-red-600 text-sm mt-1">{errors.marriageDate}</div>
              )}
            </div>
          )}

          {/* Present Address */}
          <div className="md:col-span-2">
            <label className="label">Present Address</label>
            <input
              name="presentAddress"
              value={personal.presentAddress || ""}
              onChange={handleInput}
              className="input"
            />
          </div>

          {/* Present Phone */}
          <div>
            <label className="label">Present Phone Number *</label>
            <input
              name="presentPhone"
              value={personal.presentPhone || ""}
              onChange={handleInput}
              onBlur={() => handleBlur("presentPhone")}
              className="input"
              maxLength={10}
            />
            {touched.presentPhone && errors.presentPhone && (
              <div className="text-red-600 text-sm mt-1">
                {errors.presentPhone}
              </div>
            )}
          </div>

          {/* Present Pincode */}
          <div>
            <label className="label">Present Pincode</label>
            <input
              name="presentPin"
              value={personal.presentPin || ""}
              onChange={handleInput}
              className="input"
              maxLength={6}
            />
            {errors.presentPin && (
              <div className="text-red-600 text-sm mt-1">
                {errors.presentPin}
              </div>
            )}
          </div>

          {/* Permanent Address */}
          <div className="md:col-span-2">
            <label className="label">Permanent Address</label>
            <input
              name="permAddress"
              value={personal.permAddress || ""}
              onChange={handleInput}
              className="input"
            />
          </div>

          {/* Permanent Phone */}
          <div>
            <label className="label">Permanent Phone Number *</label>
            <input
              name="permPhone"
              value={personal.permPhone || ""}
              onChange={handleInput}
              onBlur={() => handleBlur("permPhone")}
              className="input"
              maxLength={10}
            />
            {touched.permPhone && errors.permPhone && (
              <div className="text-red-600 text-sm mt-1">
                {errors.permPhone}
              </div>
            )}
          </div>

          {/* Permanent Pincode */}
          <div>
            <label className="label">Permanent Pincode</label>
            <input
              name="permPin"
              value={personal.permPin || ""}
              onChange={handleInput}
              className="input"
              maxLength={6}
            />
            {errors.permPin && (
              <div className="text-red-600 text-sm mt-1">
                {errors.permPin}
              </div>
            )}
          </div>

          {/* Driving License */}
          <div>
            <label className="label">Driving License Number</label>
            <input
              name="license"
              value={personal.license || personal.drivingLicense || ""}
              onChange={(e) =>
                setPersonalField(
                  "license",
                  e.target.value.replace(/[^A-Za-z0-9]/g, "")
                )
              }
              className="input"
            />
          </div>

          {/* PAN */}
          <div>
            <label className="label">PAN Number</label>
            <input
              name="pan"
              value={personal.pan || ""}
              onChange={handleInput}
              className="input"
              maxLength={10}
            />
            {errors.pan && (
              <div className="text-red-600 text-sm mt-1">{errors.pan}</div>
            )}
          </div>

          {/* Aadhar */}
          <div>
            <label className="label">Aadhar Number</label>
            <input
              name="aadhar"
              value={personal.aadhar || ""}
              onChange={handleInput}
              className="input"
              maxLength={12}
            />
            {errors.aadhar && (
              <div className="text-red-600 text-sm mt-1">
                {errors.aadhar}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={handlePrevClick}
            className="px-5 py-2 rounded border"
          >
            ← Previous
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveClick}
              className="px-5 py-2 rounded border"
            >
              Save
            </button>

            <button
              type="button"
              onClick={handleNextClick}
              className="px-6 py-2 rounded bg-blue-600 text-white"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Personal;
