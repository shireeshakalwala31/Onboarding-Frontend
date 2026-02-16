// src/utils/pdf.js
import jsPDF from "jspdf";

/**
 * generatePDF(employee, companyName)
 * - employee: full employee object (as stored in your app)
 * - companyName: optional string to show in header
 *
 * Note: attempting to include an image from /public may fail due to CORS in some setups.
 * The function tries to include /WamazonLogo.png but will continue if it can't.
 */
export async function generatePDF(employee = {}, companyName = "WAMAZON IT SOLUTIONS") {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 40;
    let y = 40;

    // Header
    doc.setFontSize(18);
    doc.text(companyName, left, y);

    // Try to add logo from public folder (best-effort; ignore if fails)
    try {
      const logoDataUrl = await loadImageAsDataUrl("/WamazonLogo.png");
      if (logoDataUrl) {
        // place logo top-right
        doc.addImage(logoDataUrl, "PNG", 450, 18, 90, 40);
      }
    } catch (err) {
      // ignore logo errors (CORS / not found)
    }

    y += 34;
    doc.setFontSize(14);
    doc.text("Employee Information", left, y);
    y += 18;
    doc.setFontSize(10);

    // helper to write key : value and wrap text
    const writeKV = (k, v) => {
      const line = `${k}: ${v ?? ""}`;
      const lines = doc.splitTextToSize(line, 500);
      doc.text(lines, left, y);
      y += lines.length * 12;
      if (y > 750) {
        doc.addPage();
        y = 40;
      }
    };

    // PERSONAL
    const p = employee.personal || {};
    doc.setFontSize(12);
    doc.text("Personal Details", left, y);
    y += 14;
    doc.setFontSize(10);
    writeKV("Name", `${p.firstName || ""} ${p.lastName || ""}`);
    writeKV("DOB", p.dob || "");
    writeKV("Place of Birth", p.placeOfBirth || "");
    writeKV("Email", p.email || "");
    writeKV("Phone", p.presentPhone || "");
    writeKV("Present Address", p.presentAddress || "");
    writeKV("Permanent Address", p.permAddress || "");
    writeKV("PAN", p.pan || "");
    writeKV("Aadhar", p.aadhar || "");

    // PF / BANK / PASSPORT
    y += 6;
    doc.setFontSize(12);
    doc.text("PF / Bank / Passport", left, y);
    y += 14;
    doc.setFontSize(10);
    const pf = employee.pf || {};
    writeKV("PF Action", pf.pfAction || "");
    writeKV("UAN", pf.uan || "");
    writeKV("PF Number", pf.pfNumber || "");
    writeKV("Bank Name", pf.bankName || "");
    writeKV("Bank Account", pf.bankAcc || "");
    writeKV("IFSC", pf.ifsc || "");
    writeKV("Passport", pf.passport || "");
    writeKV("Passport Validity", pf.validity || "");

    // OFFICE
    y += 6;
    doc.setFontSize(12);
    doc.text("Office Details", left, y);
    y += 14;
    doc.setFontSize(10);
    const o = employee.office || {};
    writeKV("Employee ID", o.empId || "");
    writeKV("Department", o.dept || "");
    writeKV("Designation", o.desig || "");
    writeKV("Date of Joining", o.doj || "");
    writeKV("Salary / CTC", o.salary || "");
    writeKV("Employment Type", o.type || "");
    writeKV("Service Agreement", o.serviceAgreement || "");
    writeKV("Original Certificates Kept", o.originalCertificatesKept ? "Yes" : "No");

    // ACADEMIC RECORDS
    if ((employee.academic || []).length) {
      y += 6;
      doc.setFontSize(12);
      doc.text("Academic Records", left, y);
      y += 14;
      doc.setFontSize(10);
      (employee.academic || []).forEach((r) => {
        writeKV(r.qualification || "Qualification", `${r.subject || ""} • ${r.year || ""} ${r.marks ? `• ${r.marks}` : ""}`);
      });
    }

    // EXPERIENCE
    if ((employee.experience || []).length) {
      y += 6;
      doc.setFontSize(12);
      doc.text("Experience", left, y);
      y += 14;
      doc.setFontSize(10);
      (employee.experience || []).forEach((r) => {
        writeKV(r.employer || "Employer", `${r.designation || ""} (${r.from || ""} — ${r.to || ""})`);
      });
    }

    // FAMILY
    if ((employee.family || []).length) {
      y += 6;
      doc.setFontSize(12);
      doc.text("Family Members", left, y);
      y += 14;
      doc.setFontSize(10);
      (employee.family || []).forEach((f) => {
        writeKV(f.name || "Member", `${f.relation || ""} • ${f.dob || ""} • ${f.blood || ""}`);
      });
    }

    // Footer
    y += 20;
    if (y > 700) {
      doc.addPage();
      y = 60;
    }
    doc.setFontSize(9);
    doc.text("Generated from WAMAZON Onboarding System", left, y);

    // Save PDF
    const filename = `employee_${(p.firstName || "unknown").replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("PDF generation error:", err);
    alert("Failed to generate PDF. See console for details.");
  }
}

/**
 * loadImageAsDataUrl(url)
 * Try to load an image URL and convert to dataURL (for jsPDF).
 * Returns dataURL string or null (on failure).
 */
function loadImageAsDataUrl(url) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = function () {
        resolve(null);
      };
      img.src = url;
      // if cached
      if (img.complete) {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        } catch (e) {
          resolve(null);
        }
      }
    } catch (e) {
      resolve(null);
    }
  });
}
