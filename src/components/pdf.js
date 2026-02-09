// src/utils/pdf.js
import jsPDF from "jspdf";

export function generatePDF(emp, company = "AMAZON IT SOLUTIONS") {
  const doc = new jsPDF("p", "pt", "a4");

  const PAGE_WIDTH = 595;
  const LEFT = 40;
  const RIGHT = PAGE_WIDTH - 40;
  let y = 40;

  /* ---------------- HELPERS ---------------- */

  const checkPage = (space = 20) => {
    if (y + space > 800) {
      doc.addPage();
      y = 40;
    }
  };

  const title = (text) => {
    checkPage(30);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(text, LEFT, y);
    y += 12;
    doc.setLineWidth(0.5);
    doc.line(LEFT, y, RIGHT, y);
    y += 12;
  };

  const row = (label, value) => {
    checkPage();
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, LEFT, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value || "-"), LEFT + 160, y);
    y += 14;
  };

  const listItem = (text) => {
    checkPage();
    doc.setFontSize(10);
    doc.text("• " + text, LEFT + 10, y);
    y += 14;
  };

  /* ---------------- HEADER ---------------- */

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(company, LEFT, y);

  y += 22;
  doc.setFontSize(14);
  doc.text("Employee Onboarding Details", LEFT, y);

  y += 25;

  /* ---------------- PERSONAL ---------------- */

  const p = emp.personal || {};

  title("Personal Information");
  row("Full Name", `${p.firstName || ""} ${p.lastName || ""}`);
  row("Date of Birth", p.dateOfBirth?.slice(0, 10));
  row("Gender", p.gender);
  row("Email", p.email);
  row("Phone", p.presentPhone);
  row("Present Address", p.presentAddress);
  row("Permanent Address", p.permanentAddress);

  /* ---------------- PF ---------------- */

  const pf = emp.pf || {};

  title("PF / Bank / Passport");
  row("PF Action", pf.pfAction);
  row("UAN Number", pf.uanNumber);
  row("Existing PF Number", pf.existingPfNumber);
  row("Bank Name", pf.bankName);
  row("Bank Account No", pf.bankAccountNumber);
  row("IFSC Code", pf.ifscCode);
  row("Passport No", pf.passportNumber);
  row("Passport Validity", pf.passportValidity);
  row("Place of Issue", pf.placeOfIssue);

  /* ---------------- ACADEMIC ---------------- */

  title("Academic Qualifications");
  if (!emp.academic.length) {
    row("Status", "No academic records");
  } else {
    emp.academic.forEach((a, i) => {
      row(
        `Qualification ${i + 1}`,
        `${a.qualification} (${a.Specialization})`
      );
      row("Institute", a.schoolOrCollege);
      row("University", a.boardOrUniversity);
      row("Year of Passing", a.passYear);
      row("Marks", a.marks);
      y += 6;
    });
  }

  /* ---------------- EXPERIENCE ---------------- */

  title("Work Experience");
  if (!emp.experience.length) {
    row("Status", "No experience");
  } else {
    emp.experience.forEach((e, i) => {
      row(`Employer ${i + 1}`, e.employerName);
      row("Designation", e.designation);
      row("Duration", `${e.fromDate} to ${e.toDate}`);
      row("Address", e.employerAddress);
      row("Salary (PA)", e.salaryPA);
      row("Skills", e.functionalSkills);
      y += 6;
    });
  }

  /* ---------------- FAMILY ---------------- */

  title("Family Details");
  emp.family.forEach((f, i) => {
    row(`Member ${i + 1}`, `${f.name} (${f.relation})`);
    row("DOB / Age", f.dob);
    row("Occupation", f.occupation);
    y += 6;
  });

  /* ---------------- DECLARATION ---------------- */

  const d = emp.declaration || {};

  title("Declaration");
  row("Smoker", d.doYouSmoke ? "Yes" : "No");
  row("Alcoholic", d.areYouAlcoholic ? "Yes" : "No");
  row("Medically Fit", d.medicallyFit ? "Yes" : "No");
  row("Convicted in Court", d.convictedInCourt ? "Yes" : "No");
  row(
    "Professional Membership",
    d.haveProfessionalMembership ? d.membershipDetails : "No"
  );

  /* ---------------- FOOTER ---------------- */

  checkPage(40);
  y += 20;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "This document is system generated and does not require signature.",
    LEFT,
    y
  );

  /* ---------------- SAVE ---------------- */

  const fileName = `Employee_${p.firstName || "Record"}.pdf`;
  doc.save(fileName);
}
