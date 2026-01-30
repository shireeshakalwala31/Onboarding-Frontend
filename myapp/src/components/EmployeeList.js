import React, { useEffect, useState } from "react";
import { generatePDF } from "../utils/pdf";
import { normalizeEmployee } from "../utils/normalizeEmployee";

export default function EmployeeList({ employees = [], onEdit, onDelete }) {
  const [list, setList] = useState([]);
  const [expanded, setExpanded] = useState(-1);

  useEffect(() => {
    const normalized = (employees || []).map(normalizeEmployee);
    setList(normalized);
  }, [employees]);

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
    </div>
  );
}
