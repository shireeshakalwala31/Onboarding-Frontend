# 🧪 Onboarding Link System - Testing Guide

## 📋 Pre-Testing Checklist

### Backend Requirements:
- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] Email service is configured (optional for testing)
- [ ] Environment variables are set:
  - `MONGO_URI`
  - `PUBLIC_WEB_URL` (e.g., http://localhost:3000)

### Frontend Requirements:
- [ ] Frontend is running (`npm start`)
- [ ] API base URL is configured in `src/api/onboardingApi.js`
- [ ] All dependencies installed (`npm install`)

---

## 🧪 Test Scenarios

### Test 1: Generate Onboarding Link ✅

**Objective:** Verify link generation works correctly

**Steps:**
1. Use Postman/Thunder Client to call the API:
```bash
POST http://localhost:5000/api/onboarding-link/generate
Content-Type: application/json

{
  "email": "test@example.com",
  "candidateName": "Test User"
}
```

**Expected Result:**
```json
{
  "message": "Onboarding link generated successfully",
  "token": "unique-token-here",
  "link": "http://localhost:3000/onboarding-link/unique-token-here",
  "email": "test@example.com"
}
```

**Verification:**
- [ ] Response status is 200
- [ ] Token is generated
- [ ] Link is properly formatted
- [ ] Email is sent (check inbox or logs)

---

### Test 2: Validate Fresh Link ✅

**Objective:** Verify fresh link validation works

**Steps:**
1. Copy the token from Test 1
2. Open browser and navigate to:
```
http://localhost:3000/onboarding-link/{token}
```

**Expected Result:**
- [ ] Page loads successfully
- [ ] Shows "Validating your onboarding link..." loading state
- [ ] Progress bar shows 0% completion
- [ ] Redirects to Personal Details section
- [ ] No error messages

---

### Test 3: Fill Personal Section ✅

**Objective:** Verify personal section saves correctly

**Steps:**
1. Fill in personal details:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@example.com"
   - Date of Birth: Select a date
   - Phone numbers, addresses, etc.
2. Upload a photo (optional)
3. Click "Save" button
4. Click "Next" button

**Expected Result:**
- [ ] "Saved successfully!" alert appears
- [ ] Progress bar updates to ~17%
- [ ] Navigates to PF section
- [ ] Data is persisted in backend

**Backend Verification:**
```bash
GET http://localhost:5000/api/onboarding-link/progress/{token}
```

Expected response shows:
```json
{
  "completionPercentage": 17,
  "personal": { "completed": true },
  "nextSection": "pf"
}
```

---

### Test 4: Partial Save and Resume ✅

**Objective:** Verify resume functionality works

**Steps:**
1. Fill PF section
2. Click "Save"
3. Fill Academic section
4. Click "Save"
5. **Close the browser tab**
6. **Reopen the same link** in a new tab

**Expected Result:**
- [ ] Page loads with existing progress
- [ ] Progress bar shows ~33% (2 sections completed)
- [ ] Auto-navigates to Experience section (next incomplete)
- [ ] Personal and PF data is pre-filled
- [ ] Can continue from Experience section

---

### Test 5: Section Navigation ✅

**Objective:** Verify navigation rules work correctly

**Steps:**
1. Try clicking on "Family" section (not yet completed)
2. Try clicking on "Personal" section (already completed)
3. Try clicking on "Experience" section (current/next)

**Expected Result:**
- [ ] Cannot navigate to Family (shows alert)
- [ ] Can navigate to Personal (completed section)
- [ ] Can navigate to Experience (next section)
- [ ] Sidebar highlights current section

---

### Test 6: Complete All Sections ✅

**Objective:** Verify full form completion flow

**Steps:**
1. Complete Experience section → Save → Next
2. Complete Family section → Save → Next
3. Reach Declaration section

**Expected Result:**
- [ ] Progress bar shows ~83% after Family
- [ ] All sections marked as completed
- [ ] Declaration section loads
- [ ] "Submit Form" button is visible

---

### Test 7: Declaration Submission ✅

**Objective:** Verify link expiry after Declaration

**Steps:**
1. Fill Declaration section:
   - Answer all Yes/No questions
   - Enter name and signature
   - Select current date
2. Click "Submit Form"

**Expected Result:**
- [ ] Success alert: "Onboarding completed successfully!"
- [ ] Redirects to login page after 2 seconds
- [ ] Link is now expired

**Backend Verification:**
```bash
GET http://localhost:5000/api/onboarding-link/validate/{token}
```

Expected response:
```json
{
  "isExpired": true,
  "message": "Link expired"
}
```

---

### Test 8: Expired Link Access ✅

**Objective:** Verify expired link cannot be reused

**Steps:**
1. Try to open the same link again:
```
http://localhost:3000/onboarding-link/{token}
```

**Expected Result:**
- [ ] Shows "Link Expired or Invalid" page
- [ ] Red warning icon displayed
- [ ] Error message: "This onboarding link has expired..."
- [ ] "Go to Login" button is visible
- [ ] Cannot access form

---

### Test 9: Invalid Token ✅

**Objective:** Verify invalid token handling

**Steps:**
1. Open browser with invalid token:
```
http://localhost:3000/onboarding-link/invalid-token-123
```

**Expected Result:**
- [ ] Shows "Link Expired or Invalid" page
- [ ] Error message displayed
- [ ] Cannot access form

---

### Test 10: Progress Percentage Calculation ✅

**Objective:** Verify progress calculation is accurate

**Steps:**
1. Complete sections one by one
2. Check progress percentage after each section

**Expected Results:**
- [ ] 0 sections: 0%
- [ ] Personal: ~17%
- [ ] Personal + PF: ~33%
- [ ] Personal + PF + Academic: ~50%
- [ ] Personal + PF + Academic + Experience: ~67%
- [ ] Personal + PF + Academic + Experience + Family: ~83%
- [ ] All + Declaration: 100%

---

### Test 11: Multiple Candidates ✅

**Objective:** Verify multiple links work independently

**Steps:**
1. Generate link for Candidate A
2. Generate link for Candidate B
3. Fill Candidate A's form partially
4. Fill Candidate B's form partially
5. Verify both maintain separate progress

**Expected Result:**
- [ ] Each link has unique token
- [ ] Progress is independent
- [ ] No data mixing between candidates

---

### Test 12: Network Error Handling ✅

**Objective:** Verify error handling works

**Steps:**
1. Stop the backend server
2. Try to save a section
3. Restart backend
4. Try again

**Expected Result:**
- [ ] Shows error alert when backend is down
- [ ] Graceful error message
- [ ] Works correctly after backend restart

---

## 🔍 Edge Cases to Test

### Edge Case 1: Empty Fields
- Try submitting sections with empty required fields
- Expected: Validation errors

### Edge Case 2: Large Photo Upload
- Upload photo > 5MB
- Expected: Error or size limit warning

### Edge Case 3: Special Characters
- Enter special characters in name fields
- Expected: Handles correctly or shows validation

### Edge Case 4: Concurrent Edits
- Open same link in two tabs
- Edit in both tabs
- Expected: Last save wins (or conflict handling)

### Edge Case 5: Browser Back Button
- Use browser back button during form filling
- Expected: Maintains state correctly

---

## 📊 Test Results Template

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Generate Link | ⬜ | |
| 2 | Validate Fresh Link | ⬜ | |
| 3 | Fill Personal Section | ⬜ | |
| 4 | Partial Save & Resume | ⬜ | |
| 5 | Section Navigation | ⬜ | |
| 6 | Complete All Sections | ⬜ | |
| 7 | Declaration Submission | ⬜ | |
| 8 | Expired Link Access | ⬜ | |
| 9 | Invalid Token | ⬜ | |
| 10 | Progress Calculation | ⬜ | |
| 11 | Multiple Candidates | ⬜ | |
| 12 | Network Error Handling | ⬜ | |

**Legend:** ✅ Pass | ❌ Fail | ⬜ Not Tested

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property 'data' of undefined"
**Solution:** Check if backend is running and API URL is correct

### Issue: Progress not saving
**Solution:** 
- Check network tab for API errors
- Verify backend endpoints are working
- Check MongoDB connection

### Issue: Link not expiring after Declaration
**Solution:**
- Verify backend `submit-declaration` endpoint
- Check if `isExpired` flag is being set

### Issue: Photo not uploading
**Solution:**
- Check file size limit
- Verify multipart/form-data handling
- Check backend file upload configuration

---

## 📝 Testing Checklist Summary

### Before Release:
- [ ] All 12 test scenarios pass
- [ ] Edge cases handled
- [ ] Error messages are user-friendly
- [ ] Progress saving works reliably
- [ ] Link expiry works correctly
- [ ] Email notifications sent (if configured)
- [ ] Mobile responsive (test on mobile devices)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance testing (load time < 3 seconds)
- [ ] Security testing (token validation, XSS prevention)

---

## 🚀 Performance Benchmarks

### Target Metrics:
- Link validation: < 500ms
- Section save: < 1 second
- Page load: < 2 seconds
- Progress update: < 300ms

### Load Testing:
- Test with 10 concurrent users
- Test with 50 concurrent users
- Monitor server response times

---

**Last Updated:** 2024-01-15
**Tested By:** _____________
**Date:** _____________
**Status:** ⬜ All Tests Passed | ⬜ Issues Found
