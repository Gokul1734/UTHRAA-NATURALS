const twilio = require('twilio');
const speakeasy = require('speakeasy');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Mock OTP service for development (when Twilio credentials are not available)
class MockOTPService {
  static async sendOTP(phoneNumber, otp) {
    console.log(`📱 Mock SMS sent to ${phoneNumber}: Your OTP is ${otp}`);
    console.log(`🔐 For development, you can use this OTP: ${otp}`);
    return { success: true, message: 'OTP sent successfully (mock)' };
  }
}

// Real OTP service using Twilio
class TwilioOTPService {
  static async sendOTP(phoneNumber, otp) {
    try {
      const message = await twilioClient.messages.create({
        body: `Your Uthraa Naturals verification code is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      console.log(`📱 SMS sent to ${phoneNumber}, SID: ${message.sid}`);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw new Error('Failed to send OTP');
    }
  }
}

// OTP generation utility
class OTPGenerator {
  static generateOTP() {
    return speakeasy.totp({
      secret: speakeasy.generateSecret().base32,
      digits: 6,
      step: 600 // 10 minutes
    });
  }

  static generateSimpleOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

// Main OTP service that chooses between mock and real service
class OTPService {
  static async sendOTP(phoneNumber, otp) {
    // Check if Twilio credentials are available
    const hasTwilioCredentials = process.env.TWILIO_ACCOUNT_SID && 
                                process.env.TWILIO_AUTH_TOKEN && 
                                process.env.TWILIO_PHONE_NUMBER;

    if (hasTwilioCredentials) {
      return await TwilioOTPService.sendOTP(phoneNumber, otp);
    } else {
      return await MockOTPService.sendOTP(phoneNumber, otp);
    }
  }

  static generateOTP() {
    return OTPGenerator.generateSimpleOTP();
  }
}

module.exports = OTPService; 