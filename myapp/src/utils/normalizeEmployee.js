export const normalizeEmployee = (e = {}) => ({
  personal: e.personal || {},
  pf: e.pfDetails || {},
  academic: e.academicDetails || [],
  experience: e.experienceDetails || [],
  family: e.familyDetails || [],
  declaration: e.declarationDetails || {},
  office: e.officeUseDetails || {},
});
