// src/api/onboardingApi.js
import axios from "axios";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://offer-documentation.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // onboarding forms should not timeout
});

// Attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Log errors for easier debugging
api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    console.error("API response error:", err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);

// -------------------------------------------
// STEP 1: Personal
// -------------------------------------------
export const savePersonalInfo = async (personalData = {}, photoFile = null) => {
  const formData = new FormData();

  const draftId =
    personalData.draftId ||
    localStorage.getItem("onboardingDraftId") ||
    localStorage.getItem("draftId") ||
    "";

  formData.append("draftId", draftId);

  // Explicit mappings & normalization (FE keys -> BE keys)
  if (personalData.dateOfBirth) formData.append("dateOfBirth", personalData.dateOfBirth);
  else if (personalData.dob) formData.append("dateOfBirth", personalData.dob);

  // Aadhaar keys
  if (personalData.aadhaar) formData.append("aadhaar", personalData.aadhaar);
  else if (personalData.aadhar) formData.append("aadhaar", personalData.aadhar);

  // Phone numbers
  if (personalData.presentPhone) formData.append("presentPhone", personalData.presentPhone);
  else if (personalData.presentphone) formData.append("presentPhone", personalData.presentphone);

  if (personalData.permanentPhone) formData.append("permanentPhone", personalData.permanentPhone);
  else if (personalData.permPhone) formData.append("permanentPhone", personalData.permPhone);
  else if (personalData.permphone) formData.append("permanentPhone", personalData.permphone);

  // Pincodes
  if (personalData.presentPincode) formData.append("presentPincode", personalData.presentPincode);
  else if (personalData.presentPin) formData.append("presentPincode", personalData.presentPin);

  if (personalData.permanentPincode) formData.append("permanentPincode", personalData.permanentPincode);
  else if (personalData.permPin) formData.append("permanentPincode", personalData.permPin);

  // Blood group
  if (personalData.bloodGroup !== undefined) formData.append("bloodGroup", personalData.bloodGroup);
  else if (personalData.blood !== undefined) formData.append("bloodGroup", personalData.blood);

  // Driving license
  if (personalData.drivingLicense !== undefined) formData.append("drivingLicense", personalData.drivingLicense);
  else if (personalData.license !== undefined) formData.append("drivingLicense", personalData.license);

  // Copy common string fields that backend expects
  const copyFields = [
    ["firstName", "firstName"],
    ["lastName", "lastName"],
    ["placeOfBirth", "placeOfBirth"],
    ["state", "state"],
    ["district", "district"],
    ["nationality", "nationality"],
    ["religion", "religion"],
    ["gender", "gender"],
    ["maritalStatus", "maritalStatus"],
    ["presentAddress", "presentAddress"],
    ["permanentAddress", "permanentAddress"],
    ["email", "email"],
  ];

  copyFields.forEach(([fe, be]) => {
    if (personalData[fe] !== undefined && personalData[fe] !== null) {
      formData.append(be, personalData[fe]);
    }
  });

  // PAN
  if (personalData.pan !== undefined) formData.append("pan", personalData.pan);

  // Photo file: accept photoFile param or personalData.photoFile
  if (photoFile) formData.append("photo", photoFile);
  else if (personalData.photoFile) formData.append("photo", personalData.photoFile);

  // Developer helper — uncomment while debugging to log what will be sent.
  // WARNING: logging FormData directly in browsers can be tricky; below enumerates entries.
  /*
  for (const pair of formData.entries()) {
    // eslint-disable-next-line no-console
    console.debug("FormData:", pair[0], "=", pair[1]);
  }
  */

  const token = localStorage.getItem("token");

  const res = await api.post("/employee/personalInfo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    timeout: 0,
  });

  if (res?.data?.draftId) {
    localStorage.setItem("onboardingDraftId", res.data.draftId);
    localStorage.setItem("draftId", res.data.draftId);
  }

  return res.data;
};

// -------------------------------------------
// STEP 2: PF Info
// -------------------------------------------
export const savePFInfo = async (draftId, data) => {
  return api.post("/employee/pfInfo", { draftId, ...data }).then((r) => r.data);
};

// -------------------------------------------
// STEP 3: Academic
// -------------------------------------------
export const saveAcademicDetails = async (draftId, academicsArray) => {
  return api.post("/employee/academic", {
    draftId,
    academics: academicsArray,
  }).then((r) => r.data);
};

// -------------------------------------------
// STEP 4: Experience (robust mapping)
// -------------------------------------------
export const saveExperienceDetails = async (draftId, experienceArray) => {
  const arr = Array.isArray(experienceArray) ? experienceArray : [];

  const converted = arr.map((row, index) => {
    const employerName =
      row.employerName ||
      row.companyName ||
      row.organization ||
      row.employer ||
      "";

    const fromDate =
      row.fromDate ||
      row.startDate ||
      row.from ||
      row.from_date ||
      row.experienceFrom ||
      "";

    const toDate =
      row.toDate ||
      row.endDate ||
      row.to ||
      row.to_date ||
      row.experienceTo ||
      "";

    return {
      serialNo: index + 1,
      draftId,

      // required fields backend expects
      employerName: String(employerName).trim(),
      fromDate,
      toDate,

      // other mappings
      designation: row.designation || row.role || "",
      employerAddress: row.employerAddress || row.address || "",
      salaryPA: row.salaryPA || row.salary || row.lastSalary || "",
      industry: row.industry || "",
      reasonForLeaving: row.reasonForLeaving || row.reason || "",

      // extras
      functionalSkills: row.functionalSkills || "",
      technicalSkills: row.technicalSkills || "",
      professionalAchievements: row.professionalAchievements || "",

      nomineeName: row.nomineeName || "",
      nomineeDob: row.nomineeDob || "",
      nomineeRelationship: row.nomineeRelationship || "",

      height: row.height || row.healthHeight || "",
      weight: row.weight || row.healthWeight || "",
      powerOfGlassLeft: row.powerOfGlassLeft || row.powerGlassLeft || "",
      powerOfGlassRight: row.powerOfGlassRight || row.powerGlassRight || "",

      majorSurgeryOrIllness: row.majorSurgeryOrIllness || row.majorSurgeryDetails || "",
      prolongedSickness: row.prolongedSickness || row.prolongedSicknessDetails || "",
      accidentHistory: row.accidentHistory || row.accidentDetails || "",
      foreignObjectInBody: row.foreignObjectInBody || row.foreignObjectDetails || "",

      // preserve other fields
      ...row,
    };
  });

  // backend accepts 'experience' or 'experiences'
  return api
    .post("/employee/experience", {
      draftId,
      experience: converted,
    })
    .then((r) => r.data);
};

// -------------------------------------------
// STEP 5: Family
// -------------------------------------------
export const saveFamilyDetails = async (draftId, familyArray) => {
  return api.post("/employee/family", { draftId, family: familyArray }).then((r) => r.data);
};

// -------------------------------------------
// STEP 6: Declaration (multipart)
// -------------------------------------------
export const saveDeclarationDetails = async (draftId, declarationData = {}, files = {}) => {
  const formData = new FormData();
  formData.append("draftId", draftId);

  Object.entries(declarationData || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, v);
  });

  if (files.specimenSignature1) formData.append("specimenSignature1", files.specimenSignature1);
  if (files.specimenSignature2) formData.append("specimenSignature2", files.specimenSignature2);
  if (files.declarationSignature) formData.append("declarationSignature", files.declarationSignature);

  const token = localStorage.getItem("token");

  return api.post("/employee/declaration", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    timeout: 0,
  }).then((r) => r.data);
};

// -------------------------------------------
// STEP 7: Office use
// -------------------------------------------
export const saveOfficeUseDetails = async (draftId, officeData) => {
  return api.post("/employee/office", { draftId, ...officeData }).then((r) => r.data);
};

// Final submit
export const submitOnboarding = async (draftId) => {
  return api.post("/employee/submit", { draftId }).then((r) => r.data);
};

// Fetch employees
export const fetchEmployeeDetails = async (employeeCode) => {
  return api.get(`/employee/${employeeCode}`).then((r) => r.data);
};

export const fetchAllEmployees = async () => {
  return api.get("/employees").then((r) => r.data);
};

// -------------------------------------------
// ONBOARDING LINK SYSTEM APIs
// -------------------------------------------

/**
 * Validate onboarding link and get progress
 * @param {string} token - Unique onboarding link token
 * @returns {Promise} - Link validation response with progress data
 */
export const validateOnboardingLink = async (token) => {
  return api.get(`/onboarding-link/validate/${token}`).then((r) => r.data);
};

/**
 * Save a specific section for onboarding link
 * @param {string} token - Unique onboarding link token
 * @param {string} section - Section name (personal, pf, academic, experience, family)
 * @param {object} data - Section data to save
 * @returns {Promise} - Save response
 */
export const saveLinkSection = async (token, section, data) => {
  return api.post(`/onboarding-link/save/${token}/${section}`, data).then((r) => r.data);
};

/**
 * Submit declaration and expire the link (final step)
 * @param {string} token - Unique onboarding link token
 * @param {object} data - Declaration data
 * @returns {Promise} - Submission response
 */
export const submitLinkDeclaration = async (token, data) => {
  return api.post(`/onboarding-link/submit-declaration/${token}`, data).then((r) => r.data);
};

/**
 * Get progress for onboarding link
 * @param {string} token - Unique onboarding link token
 * @returns {Promise} - Progress data with completion percentage
 */
export const getLinkProgress = async (token) => {
  return api.get(`/onboarding-link/progress/${token}`).then((r) => r.data);
};

/**
 * Authenticate (sign) an onboarding link before exposing personal onboarding data.
 * Backend should verify provided credentials (email/dob/otp or similar) for the token
 * and return either the onboarding data or a short-lived session token + draftId.
 *
 * Example usage (frontend):
 * 1. call validateOnboardingLink(token) -> if valid show sign form
 * 2. on sign submit call authenticateOnboardingLink(token, { email, dob })
 * 3. on success use returned data or session token to fetch/continue onboarding
 */
export const authenticateOnboardingLink = async (token, credentials) => {
  return api.post(`/onboarding-link/authenticate/${token}`, credentials).then((r) => r.data);
};

/**
 * Fetch onboarding data using a validated token or a session token returned by authenticateOnboardingLink.
 * Use this only after successful authentication.
 */
export const fetchOnboardingDataForLink = async (tokenOrSession) => {
  return api.get(`/onboarding-link/data/${tokenOrSession}`).then((r) => r.data);
};

export default api;
