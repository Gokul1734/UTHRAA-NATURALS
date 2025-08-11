# User Management System Setup Guide

## Overview
This guide will help you set up the complete user management system for Uthraa Naturals admin panel, including user analytics, categorization, and bulk email functionality.

## Features Implemented

### 1. User Management Dashboard
- View all users with pagination and search
- User categorization (Bronze, Silver, Gold, Diamond) based on spending and order count
- User status management (activate/deactivate)
- Detailed user profiles with order history

### 2. User Analytics
- Total users, active users, verified users statistics
- User category distribution
- Registration trends (last 6 months)
- Top customers by spending

### 3. Bulk Email System
- Send emails to all users or specific categories
- Email templates (Welcome, Newsletter, Promotional)
- Custom targeting based on order count and spending
- Professional HTML email templates

## Backend Setup

### 1. Install Dependencies
```bash
cd SERVER
npm install nodemailer
```

### 2. Email Configuration
The system uses Nodemailer with fallback to Ethereal Email for testing. For production, configure your SMTP settings:

#### Option 1: Gmail (Recommended for testing)
```bash
# Add to your .env file
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Uthraa Naturals <your-email@gmail.com>
```

#### Option 2: Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM=Uthraa Naturals <your-email@outlook.com>
```

#### Option 3: Custom SMTP
```bash
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
EMAIL_FROM=Uthraa Naturals <your-email@domain.com>
```

### 3. API Endpoints Created

#### User Management
- `GET /admin/users` - Get all users with statistics
- `GET /admin/users/:userId` - Get user details with order history
- `PATCH /admin/users/:userId/status` - Update user status

#### Analytics
- `GET /admin/users/analytics/overview` - Get user analytics

#### Email Management
- `GET /admin/email/templates` - Get email templates
- `POST /admin/email/send-bulk` - Send bulk emails

## Frontend Setup

### 1. Route Configuration
The user management route is already added to `App.jsx`:
```jsx
<Route path="/admin/users" element={
  <AdminRoute>
    <UserManagement />
  </AdminRoute>
} />
```

### 2. Navigation
The Users menu item is already configured in `AdminLayout.jsx` and will appear in the admin sidebar.

## User Categorization Logic

Users are automatically categorized based on their spending and order history:

- **Bronze**: Default category for all users
- **Silver**: Users with ₹2,000+ spent AND 3+ orders
- **Gold**: Users with ₹5,000+ spent AND 5+ orders  
- **Diamond**: Users with ₹10,000+ spent AND 10+ orders

## Email Templates

### 1. Welcome Email
- Sent to new users
- Introduces the brand and product categories
- Encourages first purchase

### 2. Newsletter
- General updates and news
- Product launches and health tips
- Customer success stories

### 3. Promotional
- Special offers and discounts
- Limited-time deals
- Personalized promotions

### 4. Custom
- Fully customizable content
- HTML support for rich formatting
- Personalization with {{name}} placeholder

## Testing the System

### 1. Start the Backend
```bash
cd SERVER
npm start
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Access the Admin Panel
1. Navigate to `http://localhost:5173/admin`
2. Login with admin credentials
3. Click on "Users" in the sidebar

### 4. Test Email Functionality
1. Go to the "Bulk Email" tab
2. Click "Send Email"
3. Fill in the form and send a test email
4. Check the console for Ethereal Email preview URLs (if using test mode)

## Email Service Features

### 1. Automatic Fallback
- If no SMTP credentials are provided, the system automatically uses Ethereal Email for testing
- Preview URLs are logged to the console for testing

### 2. Batch Processing
- Emails are sent in batches of 10 to avoid rate limiting
- 1-second delay between batches
- Detailed success/failure reporting

### 3. Error Handling
- Graceful handling of email failures
- Individual email status tracking
- Console logging for debugging

## Security Features

### 1. Authentication
- All endpoints require admin authentication
- JWT token validation on all requests
- Role-based access control

### 2. Data Protection
- Sensitive user data (passwords, OTP) excluded from responses
- Input validation and sanitization
- Rate limiting on email sending

## Troubleshooting

### 1. Email Not Sending
- Check SMTP credentials in .env file
- Verify network connectivity
- Check console for error messages
- Use Ethereal Email for testing

### 2. User Data Not Loading
- Verify MongoDB connection
- Check admin authentication
- Ensure JWT token is valid

### 3. Analytics Not Working
- Verify user and order data exists
- Check database queries
- Ensure proper date formatting

## Production Deployment

### 1. Environment Variables
- Set all required environment variables
- Use production SMTP service
- Configure proper CORS settings

### 2. Database
- Use production MongoDB instance
- Ensure proper indexing for performance
- Regular backups

### 3. Email Service
- Use reliable SMTP provider (SendGrid, Mailgun, etc.)
- Configure proper SPF/DKIM records
- Monitor email delivery rates

## API Documentation

### User Management Endpoints

#### Get All Users
```http
GET /admin/users?page=1&limit=20&search=john&category=Gold&sortBy=createdAt&sortOrder=desc
```

#### Get User Details
```http
GET /admin/users/:userId
```

#### Update User Status
```http
PATCH /admin/users/:userId/status
Content-Type: application/json

{
  "isActive": true
}
```

#### Get Analytics
```http
GET /admin/users/analytics/overview
```

#### Send Bulk Email
```http
POST /admin/email/send-bulk
Content-Type: application/json

{
  "subject": "Welcome to Uthraa Naturals!",
  "content": "Dear {{name}}, welcome to our community!",
  "emailType": "welcome",
  "recipients": "all",
  "category": "Gold",
  "minOrders": 5,
  "minSpent": 2000
}
```

## Support

For any issues or questions:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test with Ethereal Email first before configuring production SMTP
4. Ensure MongoDB is running and accessible

The system is now ready for use! 🎉 