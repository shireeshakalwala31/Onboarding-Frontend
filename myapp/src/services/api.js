// Simple mock API to simulate real-time behavior (console logs OTP)
export const authAPI = {
  login: async ({ email }) => {
    await new Promise((r) => setTimeout(r, 400));
    return { data: { token: "mock-token", user: { email } } };
  },
  register: async (userData) => {
    await new Promise((r) => setTimeout(r, 400));
    return { data: { token: "mock-token", user: userData } };
  },
  logout: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return { data: {} };
  },
  sendOtp: async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`otp_${email}`, otp);
    // In real app you'd send email; here we print so you can test
    // Check browser console for the OTP
    console.log(`Mock OTP for ${email}: ${otp}`);
    await new Promise((r) => setTimeout(r, 300));
    return { data: { success: true } };
  },
  verifyOtp: async (email, otp) => {
    await new Promise((r) => setTimeout(r, 300));
    const stored = localStorage.getItem(`otp_${email}`);
    if (stored === otp) return { data: { valid: true } };
    const err = new Error("Invalid OTP");
    err.response = { status: 400 };
    throw err;
  },
  resetPassword: async (email, newPassword) => {
    await new Promise((r) => setTimeout(r, 300));
    localStorage.removeItem(`otp_${email}`);
    console.log(`Password reset for ${email}: ${newPassword} (mock)`);
    return { data: { success: true } };
  },
};