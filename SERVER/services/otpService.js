// Try to import Twilio and Speakeasy, with fallbacks if not available
let twilio = null;
let speakeasy = null;

try {
  twilio = require('twilio');
} catch (error) {
  console.log('Twilio not available, using mock SMS service');
}

try {
  speakeasy = require('speakeasy');
} catch (error) {
  console.log('Speakeasy not available, using simple OTP generation');
}

// Mock OTP Service for development
class MockOTPService {
  static async sendOTP(phoneNumber, otp) {
    console.log(`📱 [MOCK SMS] OTP ${otp} sent to ${phoneNumber}`);
    console.log(`🔐 For development: Use this OTP to login`);
    return { success: true, message: 'OTP sent successfully (mock)' };
  }
}

// Twilio OTP Service for production
class TwilioOTPService {
  static async sendOTP(phoneNumber, otp) {
    if (!twilio) {
      throw new Error('Twilio not available');
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    try {
      const message = await client.messages.create({
        body: `Your Uthraa Naturals verification code is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return { success: true, message: 'OTP sent successfully', sid: message.sid };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw new Error('Failed to send SMS');
    }
  }
}

// OTP Generator
class OTPGenerator {
  static generateSimpleOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateSecureOTP() {
    if (speakeasy) {
      return speakeasy.totp({
        secret: speakeasy.generateSecret().base32,
        digits: 6
      });
    }
    return this.generateSimpleOTP();
  }
}

// Main OTP Service
class OTPService {
  static async sendOTP(phoneNumber, otp) {
    const hasTwilioCredentials = process.env.TWILIO_ACCOUNT_SID && 
                                process.env.TWILIO_AUTH_TOKEN && 
                                process.env.TWILIO_PHONE_NUMBER;
    
    if (hasTwilioCredentials && twilio) {
      return await TwilioOTPService.sendOTP(phoneNumber, otp);
    } else {
      return await MockOTPService.sendOTP(phoneNumber, otp);
    }
  }

  static generateOTP() {
    return OTPGenerator.generateSecureOTP();
  }
}

module.exports = OTPService; 