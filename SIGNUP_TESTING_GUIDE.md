# Signup Page Testing Guide

## ✅ **Current Status**

### **OAuth Configuration:**
- **Google Sheets**: ✅ Configured with real Client ID
- **Microsoft Excel**: ✅ Configured with real Client ID and Secret
- **URL Schemes**: ✅ Already configured in `app.json`

### **Signup Page Features:**
- ✅ Complete form validation
- ✅ Password strength indicator
- ✅ Real-time error messages
- ✅ Loading states
- ✅ Responsive design
- ✅ Safe area support

---

## 🔧 **How to Test Signup Page**

### **Step 1: Start the App**
```bash
# Start the development server
npm start
# or
npx expo start
```

### **Step 2: Navigate to Signup Page**
1. **Open your app**
2. **Go to**: `/auth` (auth landing page)
3. **Click "Create Account"** button
4. **Or directly navigate to**: `/auth/signup`

### **Step 3: Test Form Validation**

#### **✅ Valid Test Data:**
```
Full Name: John Doe
Email: john.doe@example.com
Password: TestPass123
Confirm Password: TestPass123
```

#### **❌ Invalid Test Cases:**

**Name Validation:**
```
Name: J (too short - should show error)
Name: (empty - should show "Full name is required")
```

**Email Validation:**
```
Email: invalid-email (should show "Please enter a valid email address")
Email: (empty - should show "Email is required")
```

**Password Validation:**
```
Password: weak (should show "Password must contain uppercase, lowercase, and number")
Password: 123 (should show "Password must be at least 6 characters")
Password: (empty - should show "Password is required")
```

**Confirm Password Validation:**
```
Confirm Password: different (should show "Passwords do not match")
```

### **Step 4: Test UI Features**

#### **Password Strength Indicator:**
- Type different passwords and watch the strength bar
- Colors should change: Red (weak) → Yellow (medium) → Green (strong)
- Text should show: "Weak" → "Medium" → "Strong"

#### **Show/Hide Password:**
- Click the eye icon next to password fields
- Password should toggle between visible and hidden

#### **Real-time Validation:**
- Start typing in any field
- Error messages should appear/disappear as you type
- Error fields should have red border

#### **Loading States:**
- Fill form with valid data and submit
- Should show loading spinner
- Progress bar should animate
- Button should be disabled during loading

---

## 🎯 **Expected Behavior**

### **✅ Successful Form Submission:**
1. **Fill all fields correctly**
2. **Click "Create Account"**
3. **Should show loading state**
4. **Attempts to call backend API**
5. **Shows network error** (since backend isn't deployed yet)
6. **Displays "Network error" message**

### **❌ Validation Errors:**
1. **Try submitting with empty fields**
2. **Should show validation errors**
3. **Form should not submit**
4. **Error fields should be highlighted**

### **✅ Navigation:**
1. **Back button** - Should go back to previous screen
2. **"Sign In" link** - Should navigate to signin page
3. **Success navigation** - Should go to main app after successful signup

---

## 🔍 **Backend Integration**

### **Current Backend Status:**
- **Backend files exist**: `backend/auth.js`, `backend/hono.ts`
- **Signup endpoint**: `https://api.biztomate.com/signup`
- **Status**: Not deployed yet

### **Expected API Call:**
```javascript
POST https://api.biztomate.com/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "TestPass123"
}
```

### **Expected Response:**
```javascript
// Success
{
  "success": true,
  "message": "Account created successfully",
  "user": { /* user data */ },
  "token": "jwt_token_here"
}

// Error
{
  "success": false,
  "error": "User already exists",
  "message": "An account with this email already exists"
}
```

---

## 🚀 **Testing Checklist**

### **Frontend Validation:**
- [ ] Name field validation (required, min 2 chars)
- [ ] Email field validation (required, valid format)
- [ ] Password field validation (required, min 6 chars, complexity)
- [ ] Confirm password validation (must match)
- [ ] Real-time error messages
- [ ] Password strength indicator
- [ ] Show/hide password functionality
- [ ] Loading states
- [ ] Form submission button disabled when loading

### **UI/UX:**
- [ ] Responsive design on different screen sizes
- [ ] Keyboard handling (KeyboardAvoidingView)
- [ ] Safe area handling
- [ ] Animations and transitions
- [ ] Error message styling
- [ ] Success message styling

### **Navigation:**
- [ ] Back button functionality
- [ ] "Sign In" link navigation
- [ ] Success navigation to main app

### **OAuth Integration:**
- [ ] Google Sheets connection works
- [ ] Microsoft Excel connection works
- [ ] Export functionality works after signup

---

## 🔧 **Troubleshooting**

### **"Network error" message:**
- This is expected since backend isn't deployed
- Frontend validation should still work
- OAuth connections should work

### **OAuth "Connection Failed":**
- Check if OAuth credentials are properly configured
- Verify bundle ID matches exactly
- Check internet connection

### **Form not submitting:**
- Check for validation errors
- Ensure all fields are filled correctly
- Check password strength requirements

---

## 📱 **Test on Different Devices**

### **iPhone:**
- Test on different iPhone sizes
- Check safe area handling
- Test keyboard behavior

### **iPad:**
- Test responsive design
- Check tablet-specific layouts
- Verify touch targets are appropriate

### **Simulator:**
- Test on iOS Simulator
- Check different orientations
- Test accessibility features

---

## ✅ **Success Criteria**

The signup page is working correctly if:

1. **✅ All validation works** - Shows appropriate error messages
2. **✅ UI is responsive** - Looks good on all screen sizes
3. **✅ Loading states work** - Shows progress during submission
4. **✅ Navigation works** - Can go back and to signin page
5. **✅ OAuth is configured** - Google Sheets and Excel connections work
6. **✅ Error handling works** - Shows friendly error messages
7. **✅ Accessibility works** - Screen readers can navigate the form

**The signup page should be ready for production once the backend is deployed!** 🎉 