# 🧪 Onboarding Link System - Complete Testing Guide

## ✅ API Base URL Configuration
**Frontend API Base:** `https://offer-documentation.onrender.com/api`

### Current Implementation
All API calls in `src/api/onboardingApi.js` correctly use relative paths with the configured base URL:
- ✅ GET `/onboarding-link/:token/login` → `https://offer-documentation.onrender.com/api/onboarding-link/:token/login`
- ✅ POST `/onboarding-link/login` → `https://offer-documentation.onrender.com/api/onboarding-link/login`
- ✅ GET `/onboarding-link/validate/:token` → `https://offer-documentation.onrender.com/api/onboarding-link/validate/:token`
- ✅ GET `/onboarding-link/progress/:token` → `https://offer-documentation.onrender.com/api/onboarding-link/progress/:token`
- ✅ POST `/onboarding-link/save/:token/:section` → `https://offer-documentation.onrender.com/api/onboarding-link/save/:token/:section`
- ✅ POST `/onboarding-link/submit-declaration/:token` → `https://offer-documentation.onrender.com/api/onboarding-link/submit-declaration/:token`

---

## 🧪 Testing Checklist with Sample Data

Use this token from your test data:
```
Token: f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b
Email: goiwicreffuddoi-7640@yopmail.com
Password: 3151DB96
```

### 1️⃣ **Frontend Route Test** (Step 1: Page Load)
**Goal:** Verify SPA routing works and page loads without 404

**Browser Test:**
```
Open URL: https://offer-documentation-frontend.onrender.com/onboarding/f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b/login
Expected: Login form appears (no 404 error)
Check Browser Console: No errors
```

**What happens in code:**
- React Router matches `/onboarding/:token/login` route
- `OnboardingLinkPage.js` component mounts
- `token` param extracted from URL

---

### 2️⃣ **GET Login Info Test** (Step 2: Prefill Email)
**Goal:** Fetch candidate email and prefill login form

**cURL Test:**
```bash
curl -X GET \
  "https://offer-documentation.onrender.com/api/onboarding-link/f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b/login" \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "email": "goiwicreffuddoi-7640@yopmail.com",
  "firstName": "Deepthi",
  "lastName": "Nelluri",
  "isExpired": false,
  "completionPercentage": 0
}
```

**Frontend Check:**
- Email field should auto-fill: `goiwicreffuddoi-7640@yopmail.com`
- Field should be read-only
- No error messages in console

---

### 3️⃣ **POST Login Test** (Step 3: Authenticate)
**Goal:** Submit email & password, receive JWT token

**cURL Test:**
```bash
curl -X POST \
  "https://offer-documentation.onrender.com/api/onboarding-link/login" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b",
    "email": "goiwicreffuddoi-7640@yopmail.com",
    "password": "3151DB96"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "onboardingToken": "f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b"
}
```

**Frontend Check (Browser DevTools):**
1. Open **Network** tab
2. Click **Login** button
3. Find POST request to `/api/onboarding-link/login`
4. Verify:
   - Status: **200**
   - Response contains `token` field
5. Open **Storage/Application** → **localStorage**
6. Verify `token` is saved with JWT value

---

### 4️⃣ **GET Validate Link Test** (Step 4: Load Progress)
**Goal:** Verify link is valid and fetch existing progress/data

**cURL Test:**
```bash
curl -X GET \
  "https://offer-documentation.onrender.com/api/onboarding-link/validate/f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response (200 OK):**
```json
{
  "isExpired": false,
  "completionPercentage": 25,
  "nextSection": "pf",
  "email": "goiwicreffuddoi-7640@yopmail.com",
  "personal": {
    "completed": true,
    "data": { "firstName": "Deepthi", "lastName": "Nelluri", ... }
  },
  "pf": {
    "completed": false,
    "data": {}
  },
  "academic": { "completed": false, "data": [] },
  "experience": { "completed": false, "data": [] },
  "family": { "completed": false, "data": [] },
  "declaration": { "completed": false, "data": {} }
}
```

**Frontend Check:**
- Login form disappears
- Onboarding form appears
- Progress bar shows: **25% Complete**
- Auto-navigated to **"PF"** step (next incomplete section)
- Previous sections (Personal) can be reviewed but not edited

---

### 5️⃣ **POST Save Section Test** (Step 5: Save Form Data)
**Goal:** Save a section (e.g., PF data)

**cURL Test:**
```bash
curl -X POST \
  "https://offer-documentation.onrender.com/api/onboarding-link/save/f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b/pf" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "pfNumber": "ABC123456",
    "doj": "2024-01-15"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "PF section saved successfully",
  "completionPercentage": 35
}
```

**Frontend Check:**
1. Fill out **PF form** with sample data
2. Click **Save** button
3. Network tab should show POST to `/api/onboarding-link/save/:token/pf`
4. Status: **200**
5. Progress bar updates to **35%**

---

### 6️⃣ **GET Progress Test** (Step 6: Check Progress)
**Goal:** Get current completion percentage

**cURL Test:**
```bash
curl -X GET \
  "https://offer-documentation.onrender.com/api/onboarding-link/progress/f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response (200 OK):**
```json
{
  "completionPercentage": 35,
  "nextSection": "academic",
  "sections": {
    "personal": { "completed": true },
    "pf": { "completed": true },
    "academic": { "completed": false },
    "experience": { "completed": false },
    "family": { "completed": false },
    "declaration": { "completed": false }
  }
}
```

---

### 7️⃣ **POST Final Submission Test** (Step 7: Submit Declaration)
**Goal:** Complete onboarding and expire the link

**cURL Test:**
```bash
curl -X POST \
  "https://offer-documentation.onrender.com/api/onboarding-link/submit-declaration/f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "agreedToTerms": true,
    "signature": "base64_encoded_signature_here"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Onboarding completed successfully! Link has been expired.",
  "completionPercentage": 100
}
```

**Frontend Check:**
1. Complete all sections (Personal, PF, Academic, Experience, Family)
2. Fill **Declaration** form
3. Click **Submit**
4. Should see success alert: "Onboarding completed successfully!"
5. Auto-redirect to `/login` after 2 seconds

---

### 8️⃣ **Expired Link Test** (Step 8: Verify Link Expiry)
**Goal:** Confirm link no longer works after submission

**Browser Test:**
```
Open URL: https://offer-documentation-frontend.onrender.com/onboarding/f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b/login
Expected: Error message "This onboarding link has expired..."
Expected: Button to go back to login
```

**cURL Test:**
```bash
curl -X GET \
  "https://offer-documentation.onrender.com/api/onboarding-link/validate/f8b8a089a297e0f4b8bfaac7728a4784815e8d32145df4f5d70508f55272299b" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response (410 or 400):**
```json
{
  "success": false,
  "message": "Onboarding link has expired",
  "isExpired": true
}
```

---

## 🔧 Debugging Tips

### Check Browser Console
```javascript
// Open DevTools → Console
// Look for:
// ✅ No CORS errors
// ✅ API response logs show correct paths
// ✅ localStorage.token is set after login
```

### Check Network Tab
```
1. Open DevTools → Network
2. Filter by "onboarding" to see API calls
3. Verify each request:
   - URL: Includes /api/onboarding-link/...
   - Method: GET or POST as expected
   - Status: 200, 400, 401, or 404 with reason
   - Headers: Authorization Bearer token present (after login)
```

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 404 on `/onboarding/.../login` | SPA fallback not working | Verify `public/_redirects` and `build/static.json` deployed |
| 404 on API call | Wrong API path | Check API_BASE_URL is `https://offer-documentation.onrender.com/api` |
| 401 Unauthorized | Missing or invalid JWT | Ensure JWT saved to localStorage after login |
| CORS Error | Backend doesn't allow frontend domain | Backend needs CORS configured for `offer-documentation-frontend.onrender.com` |
| Email not prefilled | getOnboardingLinkLoginInfo failed | Check GET `/api/onboarding-link/:token/login` works |

---

## 📋 Quick Test Sequence

**Run this order to test the full flow:**

1. ✅ Open frontend URL in browser → See login form
2. ✅ Check email is prefilled
3. ✅ Enter password and click Login
4. ✅ See onboarding form appear
5. ✅ Fill Personal section → Click Save
6. ✅ Check progress bar updated
7. ✅ Fill all remaining sections
8. ✅ Submit Declaration
9. ✅ See success message and redirect
10. ✅ Try reopening link → See expired message

---

## 🚀 Ready for Production?

When you pass all tests above, you're ready to:
- ✅ Deploy frontend to Render
- ✅ Enable production analytics
- ✅ Send real candidate links
- ✅ Monitor in production (logs, error tracking)

