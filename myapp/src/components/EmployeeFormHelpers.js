// src/components/EmployeeFormHelpers.js
export function getDraftId(form) {
  return form?.draftId || localStorage.getItem("draftId") || localStorage.getItem("onboardingDraftId") || "";
}

export function showApiError(err) {
  const msg = err?.response?.data?.message || err?.message || "Server error";
  window.alert(msg);
}
