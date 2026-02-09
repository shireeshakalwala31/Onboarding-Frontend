# 📘 Onboarding Link System - User Guide

## 🎯 Overview

The Onboarding Link System allows HR/Admin to send unique, one-time onboarding links to qualified candidates. Candidates can fill the form at their own pace, with automatic progress saving and resume capability.

---

## 🔑 Key Features

### ✅ For Candidates:
- **Unique Link**: Each candidate gets a personalized onboarding link
- **Auto-Save**: Progress is automatically saved after each section
- **Resume Anytime**: Close the browser and continue later from where you left off
- **Progress Tracking**: Visual progress bar shows completion percentage
- **One-Time Use**: Link expires after 100% completion (Declaration submitted)
- **No Login Required**: Direct access via link (no authentication needed)

### ✅ For HR/Admin:
- **Link Generation**: Generate unique links via backend API
- **Email Notification**: Automatic email sent to candidates
- **Progress Monitoring**: Track candidate progress in real-time
- **Link Management**: View all active/expired links
- **Partial Completion**: Links remain active until Declaration is submitted

---

## 🚀 How to Use

### For HR/Admin: Generating Onboarding Links

#### Step 1: Generate Link via API
```bash
POST /api/onboarding-link/generate
Content-Type: application/json

{
  "email": "candidate@example.com",
  "candidateName": "John Doe"
}
```

**Response:**
```json
{
  "message": "Onboarding link generated successfully",
  "token": "abc123xyz789...",
  "link": "http://localhost:3000/onboarding-link/abc123xyz789...",
  "email": "candidate@example.com"
}
```

#### Step 2: Email Sent Automatically
The system automatically sends an email to the candidate with:
- Personalized greeting
- Unique onboarding link
- Instructions

#### Step 3: Monitor Progress
```bash
GET /api/onboarding-link/progress/{token}
```

**Response:**
```json
{
  "completionPercentage": 50,
  "personal": { "completed": true },
  "pf": { "completed": true },
  "academic": { "completed": true },
  "experience": { "completed": false },
  "family": { "completed": false },
  "declaration": { "completed": false },
  "nextSection": "experience",
  "isFullyCompleted": false
}
```

---

### For Candidates: Filling the Onboarding Form

#### Step 1: Open the Link
Click the link received in your email:
```
http://localhost:3000/onboarding-link/abc123xyz789...
```

#### Step 2: View Progress
- See your completion percentage at the top
- Progress bar shows how much is completed
- Current section is highlighted

#### Step 3: Fill Sections
The form has 6 sections:
1. **Personal Details** - Basic information, address, contact
2. **PF Information** - Provident Fund details
3. **Academic Qualifications** - Education history
4. **Work Experience** - Previous employment
5. **Family Details** - Family members information
6. **Declaration** - Final declarations and signature

#### Step 4: Save Progress
- Click "Save" button in each section
- Progress is automatically saved
- You can close the browser anytime

#### Step 5: Resume Later
- Open the same link again
- System automatically loads your progress
- Continues from where you left off

#### Step 6: Complete Declaration
- Fill all previous sections first
- Complete the Declaration section
- Click "Submit Form"
- Link expires after submission

---

## 📊 Section-by-Section Guide

### 1️⃣ Personal Details
**Required Fields:**
- First Name, Last Name
- Date of Birth
- Email, Phone Numbers
- Present & Permanent Address
- Aadhaar, PAN
- Photo Upload

**Tips:**
- Upload a clear passport-size photo
- Ensure addresses are complete
- Double-check Aadhaar and PAN numbers

---

### 2️⃣ PF Information
**Required Fields:**
- UAN Number
- Previous PF Account Number (if applicable)
- Nominee Details

**Tips:**
- Keep your UAN number handy
- Nominee details are mandatory

---

### 3️⃣ Academic Qualifications
**Add Multiple Entries:**
- Degree/Qualification
- Institution Name
- Year of Passing
- Percentage/CGPA

**Tips:**
- Add all qualifications (10th, 12th, Graduation, etc.)
- Use "Add More" button for multiple entries
- Ensure year and percentage are correct

---

### 4️⃣ Work Experience
**Add Multiple Entries:**
- Company Name
- Designation
- From Date - To Date
- Salary
- Reason for Leaving

**Tips:**
- Add all previous employers
- Dates should be in chronological order
- Be honest about reason for leaving

---

### 5️⃣ Family Details
**Add Family Members:**
- Name
- Relationship
- Date of Birth
- Occupation

**Tips:**
- Include spouse, children, parents
- Ensure DOB is accurate

---

### 6️⃣ Declaration (Final Step)
**Important:**
- Read all declarations carefully
- Answer Yes/No questions honestly
- Sign with your full name
- Select current date

**After Submission:**
- Link will expire immediately
- You cannot edit after submission
- Confirmation message will appear

---

## ⚠️ Important Notes

### Link Expiry Rules:
- ✅ Link remains active during partial completion
- ✅ Can save and resume multiple times
- ❌ Link expires ONLY after Declaration submission
- ❌ Cannot reuse expired link

### Progress Saving:
- Auto-saves after each section
- No manual save needed between sections
- Progress persists across browser sessions

### Navigation:
- Can navigate to completed sections
- Cannot skip to incomplete sections
- Must complete sections in order

---

## 🐛 Troubleshooting

### Issue: "Link Expired or Invalid"
**Cause:** Link has already been used or is invalid
**Solution:** Contact HR for a new link

### Issue: "Cannot navigate to next section"
**Cause:** Previous section not completed
**Solution:** Complete current section first, then click Next

### Issue: "Progress not saving"
**Cause:** Network issue or server error
**Solution:** 
- Check internet connection
- Try again after a few minutes
- Contact support if issue persists

### Issue: "Photo not uploading"
**Cause:** File size too large or wrong format
**Solution:**
- Use JPG/PNG format
- Keep file size under 2MB
- Ensure image is clear

---

## 📞 Support

For technical issues or questions:
- **Email:** support@company.com
- **Phone:** +1-XXX-XXX-XXXX
- **Hours:** Monday-Friday, 9 AM - 6 PM

---

## 🔒 Privacy & Security

- Your data is encrypted and secure
- Link is unique and cannot be shared
- One-time use prevents unauthorized access
- Data is stored securely on our servers

---

## ✅ Checklist Before Submission

- [ ] All personal details filled correctly
- [ ] Photo uploaded (clear, passport-size)
- [ ] PF information provided
- [ ] All academic qualifications added
- [ ] Work experience details complete
- [ ] Family members information added
- [ ] All declarations read and answered
- [ ] Signature and date provided
- [ ] Reviewed all sections for accuracy

---

**Last Updated:** 2024-01-15
**Version:** 1.0
