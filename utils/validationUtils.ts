// Input sanitization function to prevent security issues
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent SQL injection
    .replace(/[;]/g, ''); // Remove semicolons
};

// Enhanced validation with comprehensive rules
export const validateField = (field: string, value: string): string | null => {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Name is required';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      if (value.trim().length > 50) return 'Name must be less than 50 characters';
      if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name can only contain letters and spaces';
      return null;
    
    case 'email':
      if (!value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
      if (value.trim().length > 100) return 'Email is too long';
      return null;
    
    case 'phone':
      if (!value.trim()) return 'Phone number is required';
      const cleanedPhone = value.replace(/\D/g, '');
      if (cleanedPhone.length < 10) return 'Please enter a valid phone number';
      if (cleanedPhone.length > 15) return 'Phone number is too long';
      return null;
    
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
      if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
      return null;
    
    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      return null;
    
    default:
      return null;
  }
};

// Password strength calculator
export const getPasswordStrength = (password: string): { 
  strength: string; 
  color: string; 
  percentage: number;
  score: number;
} => {
  if (!password) return { 
    strength: '', 
    color: '#6C757D', 
    percentage: 0, 
    score: 0 
  };
  
  let score = 0;
  const checks = [
    password.length >= 8,
    /(?=.*[a-z])/.test(password),
    /(?=.*[A-Z])/.test(password),
    /(?=.*\d)/.test(password),
    /(?=.*[@$!%*?&])/.test(password),
    password.length >= 12,
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  ];
  
  checks.forEach(check => {
    if (check) score += 14.28; // 100 / 7 checks
  });
  
  if (score <= 25) return { 
    strength: 'Weak', 
    color: '#EF5350', 
    percentage: score, 
    score 
  };
  if (score <= 50) return { 
    strength: 'Fair', 
    color: '#FFCA28', 
    percentage: score, 
    score 
  };
  if (score <= 75) return { 
    strength: 'Good', 
    color: '#42A5F5', 
    percentage: score, 
    score 
  };
  return { 
    strength: 'Strong', 
    color: '#66BB6A', 
    percentage: score, 
    score 
  };
};

// Validate complete form
export const validateForm = (formData: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const nameError = validateField('name', formData.name);
  const emailError = validateField('email', formData.email);
  const phoneError = formData.phone ? validateField('phone', formData.phone) : null;
  const passwordError = validateField('password', formData.password);
  const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);

  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;
  if (phoneError) errors.phone = phoneError;
  if (passwordError) errors.password = passwordError;
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  // Additional check for password confirmation
  if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 