# Phone Authentication Setup Guide

This guide explains how to set up phone number authentication with OTP verification for the Uthraa Naturals application.

## Features

- Phone number registration and login
- OTP (One-Time Password) verification via SMS
- Resend OTP functionality with countdown timer
- Fallback to mock SMS for development
- Integration with existing email/password authentication

## Environment Variables

Create a `.env` file in the SERVER directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/uthraa-naturals

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Twilio Configuration (for SMS OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Twilio Setup (Optional)

For production SMS functionality:

1. Sign up for a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token from the Twilio Console
3. Get a Twilio phone number for sending SMS
4. Add these credentials to your `.env` file

If Twilio credentials are not provided, the system will use mock SMS (logs to console) for development.

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register with email, password, and phone
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/logout` - Logout (client-side token removal)

### Phone Authentication Flow

1. **Send OTP**: User enters phone number → OTP sent via SMS
2. **Verify OTP**: User enters 6-digit code → JWT token generated
3. **Login**: User is authenticated and redirected

## Frontend Routes

- `/login` - Email/password login with phone login option
- `/phone-login` - Dedicated phone number login page
- `/register` - Registration with phone number field

## User Model Updates

The User model now includes:

- `phone` - Phone number (unique, required)
- `isPhoneVerified` - Phone verification status
- `phoneVerificationOTP` - Temporary OTP storage
- `phoneVerificationExpires` - OTP expiration time
- `loginMethod` - Preferred login method

## Security Features

- OTP expires after 10 minutes
- Phone numbers are validated
- JWT tokens for session management
- Protected routes with middleware
- Rate limiting for OTP requests (can be added)

## Development Mode

In development mode without Twilio:
- OTP codes are logged to console
- Any 6-digit code is accepted for verification
- Mock SMS messages are displayed

## Testing

1. Start the server: `npm run dev`
2. Start the frontend: `npm run dev`
3. Navigate to `/phone-login`
4. Enter a phone number (e.g., +1-555-123-4567)
5. Check server console for OTP code
6. Enter the OTP to login

## Production Considerations

- Set up proper Twilio credentials
- Implement rate limiting for OTP requests
- Add phone number validation for specific countries
- Consider using a different SMS service for cost optimization
- Implement proper error handling and logging
- Add monitoring for failed SMS deliveries 