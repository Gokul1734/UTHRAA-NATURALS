// Test script for phone authentication system
const OTPService = require('./services/otpService');

console.log('Testing Phone Authentication System...\n');

// Test OTP generation
console.log('1. Testing OTP Generation:');
const otp = OTPService.generateOTP();
console.log(`Generated OTP: ${otp}`);
console.log(`OTP Length: ${otp.length}`);
console.log(`Is 6 digits: ${/^\d{6}$/.test(otp)}\n`);

// Test mock SMS sending
console.log('2. Testing Mock SMS Service:');
const testPhone = '+1-555-123-4567';
OTPService.sendOTP(testPhone, otp)
  .then(result => {
    console.log('SMS Result:', result);
    console.log('✅ Mock SMS service working correctly\n');
  })
  .catch(error => {
    console.log('❌ SMS service error:', error.message);
  });

// Test phone number validation
console.log('3. Testing Phone Number Validation:');
const validPhones = [
  '+1-555-123-4567',
  '+91 98765 43210',
  '(555) 123-4567',
  '555-123-4567'
];

const invalidPhones = [
  'abc',
  '123',
  '555-123',
  ''
];

console.log('Valid phone numbers:');
validPhones.forEach(phone => {
  const isValid = /^\+?[\d\s\-\(\)]+$/.test(phone);
  console.log(`  ${phone}: ${isValid ? '✅' : '❌'}`);
});

console.log('\nInvalid phone numbers:');
invalidPhones.forEach(phone => {
  const isValid = /^\+?[\d\s\-\(\)]+$/.test(phone);
  console.log(`  ${phone}: ${isValid ? '❌' : '✅'}`);
});

console.log('\n✅ Phone authentication system test completed!'); 