const User = require('../models/user');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { generateToken } = require('../utils/jwt');

// Signup controller
module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login controller
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user (protected route)
module.exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Google OAuth login (Access Token approach)
module.exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify access token by fetching user info from Google
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { email, name, email_verified } = response.data;

    // Check if email is verified by Google
    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Google email not verified'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Unable to get user information from Google'
      });
    }

    // Simple user lookup/creation
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: name || email.split('@')[0],
        email,
        password: 'google_oauth_' + Date.now(), // Random password for OAuth users
        isGoogleUser: true
      });
      await user.save({ validateBeforeSave: false });
    }

    // Generate auth token
    const authToken = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        token: authToken,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    
    // Handle specific Google API errors
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google access token'
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        message: 'Google API access forbidden'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Google login failed. Please try again.'
    });
  }
};
