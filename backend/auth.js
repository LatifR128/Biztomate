const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock database - replace with your actual database
let users = [];

/**
 * User signup
 * POST /signup
 */
router.post('/signup', [
  // Validation middleware
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      subscriptionPlan: 'free',
      cardsScanned: 0,
      trialDaysRemaining: 3
    };

    // Save user (in real app, save to database)
    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    console.log('User created successfully:', { email, name, id: newUser.id });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create account. Please try again.'
    });
  }
});

/**
 * User signin
 * POST /signin
 */
router.post('/signin', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('User signed in successfully:', { email, id: user.id });

    res.json({
      success: true,
      message: 'Signed in successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to sign in. Please try again.'
    });
  }
});

/**
 * Get user profile
 * GET /profile
 */
router.get('/profile', async (req, res) => {
  try {
    // In a real app, you'd verify the JWT token here
    const { userId } = req.user || {};
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get profile error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get profile'
    });
  }
});

/**
 * Update user subscription
 * PUT /subscription
 */
router.put('/subscription', async (req, res) => {
  try {
    const { userId } = req.user || {};
    const { subscriptionPlan } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Update subscription plan
    user.subscriptionPlan = subscriptionPlan;
    user.updatedAt = new Date().toISOString();

    // Return updated user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    console.log('Subscription updated:', { userId, subscriptionPlan });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update subscription'
    });
  }
});

module.exports = router; 