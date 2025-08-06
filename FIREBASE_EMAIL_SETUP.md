# Firebase Email Template Setup for Biztomate

## Overview
This guide explains how to configure Firebase Authentication email templates to send branded password reset emails under the Biztomate name.

## Steps to Configure Email Templates

### 1. Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `biztomate-scanner-4d73e`
3. Navigate to **Authentication** > **Templates**

### 2. Configure Password Reset Email Template

#### Email Subject
```
Reset your Biztomate password
```

#### Sender Name
```
Biztomate
```

#### Sender Email
```
noreply@biztomate.com
```

#### HTML Template
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Biztomate Password</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background-color: #f8f9fa; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
      background-color: white; 
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px; 
      padding: 20px 0; 
      border-bottom: 2px solid #007AFF; 
    }
    .logo { 
      font-size: 28px; 
      font-weight: bold; 
      color: #007AFF; 
      margin-bottom: 10px; 
    }
    .tagline {
      font-size: 14px;
      color: #666;
    }
    .content { 
      background: #f8f9fa; 
      padding: 30px; 
      border-radius: 12px; 
      margin: 20px 0; 
    }
    .button { 
      display: inline-block; 
      background: #007AFF; 
      color: white; 
      padding: 14px 28px; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 600; 
      font-size: 16px; 
    }
    .button:hover {
      background: #0056CC;
    }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      color: #666; 
      font-size: 14px; 
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Biztomate</div>
      <div class="tagline">AI-Powered Business Card Scanner</div>
    </div>
    
    <div class="content">
      <h2 style="margin-top: 0; color: #007AFF;">Reset Your Password</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password for your Biztomate account. Click the button below to create a new password:</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{link}}" class="button">Reset Password</a>
      </p>
      
      <div class="warning">
        <strong>Security Notice:</strong> This link will expire in 1 hour for security reasons.
      </div>
      
      <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      
      <p>Best regards,<br><strong>The Biztomate Team</strong></p>
    </div>
    
    <div class="footer">
      <p>This email was sent from Biztomate. If you have any questions, please contact our support team.</p>
      <p>&copy; 2024 Biztomate. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

#### Plain Text Template
```
Reset Your Biztomate Password

Hello,

We received a request to reset your password for your Biztomate account. Click the link below to create a new password:

{{link}}

SECURITY NOTICE: This link will expire in 1 hour for security reasons.

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The Biztomate Team

---
This email was sent from Biztomate. If you have any questions, please contact our support team.
© 2024 Biztomate. All rights reserved.
```

### 3. Configure Action Code Settings

In your Firebase project settings, ensure the following action code settings are configured:

#### Web App URL
```
https://biztomate-scanner-4d73e.firebaseapp.com/reset-password
```

#### iOS Bundle ID
```
com.biztomate.scanner
```

#### Android Package Name
```
com.biztomate.scanner
```

#### Dynamic Link Domain
```
biztomate.page.link
```

### 4. Test the Email Template

1. Go to **Authentication** > **Users**
2. Find a test user or create one
3. Click on the user and select "Send password reset email"
4. Check that the email is received with proper Biztomate branding

### 5. Additional Email Templates

You can also configure other email templates:

#### Email Verification Template
- **Subject**: "Verify your Biztomate email address"
- **Sender Name**: "Biztomate"
- Use similar HTML structure as password reset

#### Email Change Template
- **Subject**: "Confirm your new Biztomate email address"
- **Sender Name**: "Biztomate"
- Use similar HTML structure as password reset

## Important Notes

1. **Domain Verification**: Ensure your domain is verified in Firebase Console
2. **SPF/DKIM Records**: Configure proper email authentication records
3. **Custom Domain**: Consider setting up a custom domain for emails (e.g., noreply@biztomate.com)
4. **Testing**: Always test email templates before going live
5. **Compliance**: Ensure emails comply with CAN-SPAM and GDPR regulations

## Troubleshooting

### Common Issues
1. **Emails not sending**: Check Firebase project settings and billing
2. **Wrong branding**: Verify template configuration in Firebase Console
3. **Links not working**: Ensure action code settings are correct
4. **Spam filters**: Check if emails are being marked as spam

### Support
If you encounter issues, check the Firebase documentation or contact Firebase support. 