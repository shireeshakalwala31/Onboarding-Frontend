import React, { useEffect, useState } from "react";
import { generatePDF } from "../utils/pdf";
import { normalizeEmployee } from "../utils/normalizeEmployee";
import { generateOnboardingLink } from "../api/onboardingApi";

export default function EmployeeList({ employees = [], onEdit, onDelete }) {
  const [list, setList] = useState([]);
  const [expanded, setExpanded] = useState(-1);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [linkFormData, setLinkFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const normalized = (employees || []).map(normalizeEmployee);
    setList(normalized);
  }, [employees]);

  const handleGenerateLinkClick = (emp, index) => {
    setSelectedEmployee(index);
    setLinkFormData({
      email: emp.personal?.email || "",
      firstName: emp.personal?.firstName || "",
      lastName: emp.personal?.lastName || "",
      password: "",
    });
    setLinkError("");
    setLinkSuccess("");
    setShowLinkModal(true);
  };

  const handleLinkFormChange = (e) => {
    const { name, value } = e.target;
    setLinkFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateLinkSubmit = async (e) => {
    e.preventDefault();
    setLinkError("");
    setLinkSuccess("");

    if (!linkFormData.email || !linkFormData.firstName || !linkFormData.lastName || !linkFormData.password) {
      setLinkError("All fields are required");
      return;
    }

    try {
      setLinkLoading(true);
      const response = await generateOnboardingLink(linkFormData);

      setLinkSuccess(`Link generated successfully! URL: ${response.url || response.link}`);
      setShowLinkModal(false);

      // Copy to clipboard
      const url = response.url || response.link;
      if (url) {
        navigator.clipboard.writeText(url);
      }
    } catch (error) {
      console.error("Generate link error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate onboarding link";
      setLinkError(msg);
    } finally {
      setLinkLoading(false);
    }
  };

  const closeModal = () => {
    setShowLinkModal(false);
    setLinkFormData({ email: "", firstName: "", lastName: "", password: "" });
    setLinkError("");
  };

  return (
    <div className="card">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Employee List</h2>
        <span className="text-sm text-gray-600">
          {list.length} record{list.length !== 1 ? "s" : ""}
        </span>
      </div>

      {list.map((emp, i) => (
        <div key={i} className="border rounded p-4 mb-4 bg-white">
          {/* HEADER */}
          <div className="flex justify-between">
            <div>
              <div className="font-bold text-lg">
                {emp.personal.firstName} {emp.personal.lastName}
              </div>
              <div className="text-sm text-gray-600">
                {emp.personal.email}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit?.(i)}
                className="text-blue-600"
              >
                Edit
              </button>

              <button
                onClick={() => generatePDF(emp)}
                className="text-purple-600"
              >
                PDF
              </button>

              <button
                onClick={() => handleGenerateLinkClick(emp, i)}
                className="text-green-600"
              >
                Generate Link
              </button>

              <button
                onClick={() => onDelete?.(i)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </div>

          {/* TOGGLE */}
          <button
            className="text-blue-500 mt-2"
            onClick={() => setExpanded(expanded === i ? -1 : i)}
          >
            {expanded === i ? "Hide details" : "View details"}
          </button>

          {/* DETAILS */}
          {expanded === i && (
            <div className="mt-4 text-sm space-y-4">

              {/* PERSONAL */}
              <div>
                <b>Personal</b>
                <div>DOB: {emp.personal.dateOfBirth?.slice(0, 10)}</div>
                <div>Phone: {emp.personal.presentPhone}</div>
                <div>Address: {emp.personal.presentAddress}</div>
                <div>Gender: {emp.personal.gender}</div>
                <div>Blood Group: {emp.personal.bloodGroup}</div>
              </div>

              {/* PF */}
              <div>
                <b>PF / Bank</b>
                <div>PF Action: {emp.pf.pfAction || "-"}</div>
                <div>UAN: {emp.pf.uanNumber || "-"}</div>
                <div>PF No: {emp.pf.existingPfNumber || "-"}</div>
                <div>Bank: {emp.pf.bankName || "-"}</div>
                <div>IFSC: {emp.pf.ifscCode || "-"}</div>
              </div>

              {/* ACADEMIC */}
              <div>
                <b>Academic</b>
                {emp.academic.length === 0 && (
                  <div>No academic records</div>
                )}
                <ul className="list-disc ml-5">
                  {emp.academic.map((a, idx) => (
                    <li key={idx}>
                      {a.qualification} – {a.Specialization} (
                      {a.passYear}) • {a.marks}%
                    </li>
                  ))}
                </ul>
              </div>

              {/* EXPERIENCE */}
              <div>
                <b>Experience</b>
                {emp.experience.length === 0 && (
                  <div>No experience</div>
                )}
                <ul className="list-disc ml-5">
                  {emp.experience.map((e, idx) => (
                    <li key={idx}>
                      {e.employerName} – {e.designation}
                      <br />
                      ({e.fromDate} → {e.toDate})
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAMILY */}
              <div>
                <b>Family</b>
                <ul className="list-disc ml-5">
                  {emp.family.map((f, idx) => (
                    <li key={idx}>
                      {f.name} – {f.relation} ({f.dob})
                    </li>
                  ))}
                </ul>
              </div>

              {/* DECLARATION */}
              <div>
                <b>Declaration</b>
                <div>Smoker: {emp.declaration.doYouSmoke ? "Yes" : "No"}</div>
                <div>
                  Alcoholic: {emp.declaration.areYouAlcoholic ? "Yes" : "No"}
                </div>
                <div>
                  Medically Fit: {emp.declaration.medicallyFit ? "Yes" : "No"}
                </div>
                <div>
                  Professional Membership:{" "}
                  {emp.declaration.haveProfessionalMembership
                    ? emp.declaration.membershipDetails
                    : "No"}
                </div>
              </div>

            </div>
          )}
        </div>
      ))}

      {/* Success Message */}
      {linkSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">Success!</p>
              <p className="text-sm break-all">{linkSuccess}</p>
              <p className="text-xs mt-2 text-green-600">Link copied to clipboard</p>
            </div>
            <button
              onClick={() => setLinkSuccess("")}
              className="text-green-700 font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Generate Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-2xl font-bold mb-4">Generate Onboarding Link</h2>
            
            <form onSubmit={handleGenerateLinkSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={linkFormData.email}
                  onChange={handleLinkFormChange}
                  placeholder="employee@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={linkFormData.firstName}
                  onChange={handleLinkFormChange}
                  placeholder="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={linkFormData.lastName}
                  onChange={handleLinkFormChange}
                  placeholder="Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={linkFormData.password}
                    onChange={handleLinkFormChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-sm text-gray-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {linkError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {linkError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {linkLoading ? "Generating..." : "Generate Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
