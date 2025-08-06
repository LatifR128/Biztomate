import { sendPasswordResetEmail, ActionCodeSettings } from 'firebase/auth';
import { Auth } from 'firebase/auth';

// Custom action code settings for password reset
const getActionCodeSettings = (): ActionCodeSettings => ({
  url: 'https://biztomate-scanner-4d73e.firebaseapp.com/reset-password',
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.biztomate.scanner',
  },
  android: {
    packageName: 'com.biztomate.scanner',
    installApp: true,
    minimumVersion: '1.0.0',
  },
  dynamicLinkDomain: 'biztomate.page.link',
});

// Custom password reset function with proper error handling
export const sendCustomPasswordResetEmail = async (auth: Auth, email: string) => {
  try {
    const actionCodeSettings = getActionCodeSettings();
    
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    
    return {
      success: true,
      message: 'Password reset email sent successfully'
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    // Handle specific Firebase Auth errors
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email address');
      case 'auth/invalid-email':
        throw new Error('Please enter a valid email address');
      case 'auth/too-many-requests':
        throw new Error('Too many requests. Please try again later');
      case 'auth/network-request-failed':
        throw new Error('Network error. Please check your connection and try again');
      default:
        throw new Error('Failed to send password reset email. Please try again.');
    }
  }
};

// Email template configuration for Firebase Console
export const emailTemplateConfig = {
  // These settings should be configured in Firebase Console
  // Authentication > Templates > Password reset
  
  // Email subject
  subject: 'Reset your Biztomate password',
  
  // Email sender name
  senderName: 'Biztomate',
  
  // Email sender address
  senderEmail: 'noreply@biztomate.com',
  
  // Email content template (HTML)
  htmlTemplate: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Biztomate Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #007AFF; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 12px; }
        .button { display: inline-block; background: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Biztomate</div>
        </div>
        
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your Biztomate account. Click the button below to create a new password:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{link}}" class="button">Reset Password</a>
          </p>
          
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <p>Best regards,<br>The Biztomate Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent from Biztomate. If you have any questions, please contact our support team.</p>
          <p>&copy; 2024 Biztomate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  // Plain text version
  textTemplate: `
    Reset Your Biztomate Password
    
    Hello,
    
    We received a request to reset your password for your Biztomate account. Click the link below to create a new password:
    
    {{link}}
    
    This link will expire in 1 hour for security reasons.
    
    If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
    
    Best regards,
    The Biztomate Team
    
    ---
    This email was sent from Biztomate. If you have any questions, please contact our support team.
    © 2024 Biztomate. All rights reserved.
  `
}; 