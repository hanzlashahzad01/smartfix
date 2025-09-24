const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  generateTwoFactorSecret,
  enableTwoFactor,
  disableTwoFactor,
  regenerateBackupCodes,
  verifyTwoFactorForSession
} = require('../middleware/twoFactor');

const router = express.Router();

// Apply authentication to all 2FA routes
router.use(authenticateToken);

// Generate 2FA setup (QR code and secret)
router.post('/setup', async (req, res) => {
  try {
    const result = await generateTwoFactorSecret(req.user._id);
    
    res.json({
      success: true,
      message: '2FA setup initiated',
      data: result
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to setup 2FA'
    });
  }
});

// Enable 2FA after verification
router.post('/enable', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const result = await enableTwoFactor(req.user._id, token);
    
    res.json({
      success: true,
      message: '2FA enabled successfully',
      data: result
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to enable 2FA'
    });
  }
});

// Disable 2FA
router.post('/disable', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to disable 2FA'
      });
    }

    const result = await disableTwoFactor(req.user._id, password);
    
    res.json({
      success: true,
      message: '2FA disabled successfully',
      data: result
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to disable 2FA'
    });
  }
});

// Verify 2FA for current session
router.post('/verify', verifyTwoFactorForSession);

// Regenerate backup codes
router.post('/backup-codes/regenerate', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to regenerate backup codes'
      });
    }

    const result = await regenerateBackupCodes(req.user._id, password);
    
    res.json({
      success: true,
      message: 'Backup codes regenerated successfully',
      data: result
    });
  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to regenerate backup codes'
    });
  }
});

// Get 2FA status
router.get('/status', async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        enabled: user.twoFactor?.enabled || false,
        hasBackupCodes: user.twoFactor?.backupCodes?.length > 0 || false,
        backupCodesCount: user.twoFactor?.backupCodes?.length || 0
      }
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get 2FA status'
    });
  }
});

module.exports = router;
