const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

// Generate 2FA secret for user
const generateTwoFactorSecret = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `SmartFix (${user.email})`,
      issuer: 'SmartFix',
      length: 32
    });

    // Store the secret temporarily (not enabled until verified)
    user.twoFactor = {
      secret: secret.base32,
      enabled: false,
      backupCodes: generateBackupCodes()
    };
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
      backupCodes: user.twoFactor.backupCodes
    };
  } catch (error) {
    throw error;
  }
};

// Verify 2FA token
const verifyTwoFactorToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps (60 seconds) of tolerance
  });
};

// Enable 2FA after verification
const enableTwoFactor = async (userId, token) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.twoFactor || !user.twoFactor.secret) {
      throw new Error('2FA setup not initiated');
    }

    const isValid = verifyTwoFactorToken(user.twoFactor.secret, token);
    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    user.twoFactor.enabled = true;
    await user.save();

    return {
      success: true,
      backupCodes: user.twoFactor.backupCodes
    };
  } catch (error) {
    throw error;
  }
};

// Disable 2FA
const disableTwoFactor = async (userId, password) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password before disabling 2FA
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    user.twoFactor = {
      secret: null,
      enabled: false,
      backupCodes: []
    };
    await user.save();

    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Generate backup codes
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
  }
  return codes;
};

// Verify backup code
const verifyBackupCode = async (userId, code) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.twoFactor || !user.twoFactor.enabled) {
      throw new Error('2FA not enabled');
    }

    const codeIndex = user.twoFactor.backupCodes.indexOf(code.toUpperCase());
    if (codeIndex === -1) {
      throw new Error('Invalid backup code');
    }

    // Remove used backup code
    user.twoFactor.backupCodes.splice(codeIndex, 1);
    await user.save();

    return { success: true, remainingCodes: user.twoFactor.backupCodes.length };
  } catch (error) {
    throw error;
  }
};

// Regenerate backup codes
const regenerateBackupCodes = async (userId, password) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    if (!user.twoFactor || !user.twoFactor.enabled) {
      throw new Error('2FA not enabled');
    }

    user.twoFactor.backupCodes = generateBackupCodes();
    await user.save();

    return {
      success: true,
      backupCodes: user.twoFactor.backupCodes
    };
  } catch (error) {
    throw error;
  }
};

// Middleware to require 2FA verification
const requireTwoFactor = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Skip 2FA check for certain routes
    const skipRoutes = ['/api/auth/2fa/', '/api/auth/logout'];
    if (skipRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }

    // Check if user has 2FA enabled
    if (user.twoFactor && user.twoFactor.enabled) {
      // Check if 2FA was verified in this session
      if (!req.session || !req.session.twoFactorVerified) {
        return res.status(403).json({
          success: false,
          message: '2FA verification required',
          requiresTwoFactor: true
        });
      }
    }

    next();
  } catch (error) {
    console.error('2FA middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify 2FA for session
const verifyTwoFactorForSession = async (req, res, next) => {
  try {
    const { token, backupCode } = req.body;
    const user = req.user;

    if (!user.twoFactor || !user.twoFactor.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA not enabled for this account'
      });
    }

    let isValid = false;

    if (token) {
      // Verify TOTP token
      isValid = verifyTwoFactorToken(user.twoFactor.secret, token);
    } else if (backupCode) {
      // Verify backup code
      try {
        await verifyBackupCode(user._id, backupCode);
        isValid = true;
      } catch (error) {
        isValid = false;
      }
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Mark 2FA as verified for this session
    if (!req.session) {
      req.session = {};
    }
    req.session.twoFactorVerified = true;
    req.session.twoFactorVerifiedAt = new Date();

    res.json({
      success: true,
      message: '2FA verification successful'
    });
  } catch (error) {
    console.error('2FA session verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  enableTwoFactor,
  disableTwoFactor,
  generateBackupCodes,
  verifyBackupCode,
  regenerateBackupCodes,
  requireTwoFactor,
  verifyTwoFactorForSession
};
