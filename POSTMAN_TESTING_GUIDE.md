# Postman Testing Guide for Uthraa Naturals API

## 🚀 Quick Start

Your API is running on `https://uthraa-naturals.onrender.com` and is working correctly! Here's how to test it in Postman.

## 📋 Setup Postman Collection

### 1. Create New Collection
- Open Postman
- Click "New" → "Collection"
- Name it "Uthraa Naturals API"

### 2. Set Environment Variables
- Click "Environments" → "New Environment"
- Name it "Local Development"
- Add these variables:
  - `baseUrl`: `https://uthraa-naturals.onrender.com`
  - `token`: (leave empty, will be set after login)

### 3. Set Collection Variables
- In your collection, go to "Variables" tab
- Add: `baseUrl` = `https://uthraa-naturals.onrender.com`

## 🔐 Authentication Flow

### Step 1: Health Check (No Auth Required)
```
GET {{baseUrl}}/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Step 2: Phone Login (Get Token)
```
POST {{baseUrl}}/api/auth/phone-login
Content-Type: application/json

{
  "phone": "9876543210"
}
```
**Expected Response:**
```json
{
  "message": "Phone login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "User 9876543210",
    "email": "9876543210@uthraa.com",
    "phone": "+919876543210",
    "role": "user"
  }
}
```

### Step 3: Extract Token
- In the login response, right-click on the `token` value
- Select "Set as environment variable"
- Choose your environment and set variable name as `token`

## 🛡️ Testing Protected Routes

### Profile Routes
```
GET {{baseUrl}}/api/auth/profile
Headers:
  Authorization: Bearer {{token}}
```

```
PUT {{baseUrl}}/api/auth/profile
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+91 98765 43210",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```

### User Routes
```
GET {{baseUrl}}/api/users/addresses
Headers:
  Authorization: Bearer {{token}}
```

```
PUT {{baseUrl}}/api/users/profile
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phone": "+91 98765 43210"
}
```

## 📦 Order Routes with Clean Order IDs

### ⚠️ **IMPORTANT: Use Clean Order IDs (No # Prefix)**

**✅ Correct Format:**
```
ORD00001, ORD00002, ORD00003
```

**❌ Wrong Format:**
```
#000001, #000002, #000003
```

### Get User Orders
```
GET {{baseUrl}}/api/orders/my-orders
Headers:
  Authorization: Bearer {{token}}
```

### Get Order by ID (Clean Format)
```
GET {{baseUrl}}/api/orders/ORD00001
Headers:
  Authorization: Bearer {{token}}
```

### Download Invoice (Clean Format)
```
GET {{baseUrl}}/api/orders/ORD00001/invoice
Headers:
  Authorization: Bearer {{token}}
```

### Admin Update Order Status (Clean Format)
```
PUT {{baseUrl}}/api/orders/admin/ORD00001/status
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json

{
  "status": "confirmed",
  "trackingNumber": "TRK123456789",
  "estimatedDelivery": "2024-01-15T00:00:00.000Z"
}
```

### Bulk Update Order Status (Clean Format)
```
POST {{baseUrl}}/api/orders/admin/bulk-update-status
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json

{
  "orderIds": ["ORD00001", "ORD00002", "ORD00003"],
  "status": "shipped",
  "trackingNumber": "TRK123456789"
}
```

## 🔧 Troubleshooting "User not found in database"

### Problem 1: Missing Authorization Header
**Error:** `"Not authorized, no token"`
**Solution:** Add `Authorization: Bearer {{token}}` header

### Problem 2: Invalid Token Format
**Error:** `"Not authorized, token failed"`
**Solution:** Ensure token format is exactly `Bearer YOUR_TOKEN_HERE`

### Problem 3: Expired Token
**Error:** `"Token expired"`
**Solution:** Login again to get a fresh token

### Problem 4: User Not Found
**Error:** `"User not found in database"`
**Solution:** 
1. Login again to get a new token
2. The user might have been deleted from database
3. Token contains invalid user ID

### Problem 5: Development Mode
If MongoDB is not connected, use the development test token:
```
Authorization: Bearer dev-test-token
```

### Problem 6: Wrong Order ID Format
**Error:** `"Order not found"`
**Solution:** Use clean order ID format: `ORD00001` (no # prefix)

## 📊 Test All Available Routes

### Public Routes (No Auth Required)
```
GET {{baseUrl}}/                    # API Information
GET {{baseUrl}}/api/health          # Health Check
GET {{baseUrl}}/api/products        # Get Products
GET {{baseUrl}}/api/categories      # Get Categories
```

### Authentication Routes
```
POST {{baseUrl}}/api/auth/register  # Register User
POST {{baseUrl}}/api/auth/login     # Email Login
POST {{baseUrl}}/api/auth/phone-login # Phone Login
POST {{baseUrl}}/api/auth/refresh-token # Refresh JWT Token
POST {{baseUrl}}/api/auth/verify-token # Verify Token
POST {{baseUrl}}/api/auth/logout    # User Logout
```

### Protected Routes (Require Auth)
```
GET {{baseUrl}}/api/auth/profile    # Get Profile
PUT {{baseUrl}}/api/auth/profile    # Update Profile
GET {{baseUrl}}/api/users/addresses # Get Addresses
POST {{baseUrl}}/api/users/addresses # Add Address
PUT {{baseUrl}}/api/users/profile   # Update User Profile
POST {{baseUrl}}/api/users/change-password # Change Password
```

### Order Routes (Require Auth) - Use Clean Order IDs
```
GET {{baseUrl}}/api/orders/my-orders # Get User Orders
GET {{baseUrl}}/api/orders/ORD00001  # Get Order by ID (clean format)
GET {{baseUrl}}/api/orders/ORD00001/invoice # Download Invoice (clean format)
POST {{baseUrl}}/api/orders/create   # Create Order
```

### Admin Routes (Require Admin Role) - Use Clean Order IDs
```
GET {{baseUrl}}/api/admin           # Admin Panel
GET {{baseUrl}}/api/dashboard       # Analytics Dashboard
PUT {{baseUrl}}/api/orders/admin/ORD00001/status # Update Order Status (clean format)
POST {{baseUrl}}/api/orders/admin/bulk-update-status # Bulk Update (clean format)
GET {{baseUrl}}/api/users/admin/all # Get All Users
```

## 🎯 Postman Collection Import

You can import this collection by creating a JSON file with the following structure:

```json
{
  "info": {
    "name": "Uthraa Naturals API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://uthraa-naturals.onrender.com"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/health",
          "host": ["{{baseUrl}}"],
          "path": ["api", "health"]
        }
      }
    },
    {
      "name": "Phone Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"phone\": \"9876543210\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/auth/phone-login",
          "host": ["{{baseUrl}}"],
          "path": ["api", "auth", "phone-login"]
        }
      }
    },
    {
      "name": "Get Order by ID (Clean Format)",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/orders/ORD00001",
          "host": ["{{baseUrl}}"],
          "path": ["api", "orders", "ORD00001"]
        }
      }
    }
  ]
}
```

## 🚨 Common Issues & Solutions

### Issue: "User not found in database"
**Causes:**
1. Invalid or expired JWT token
2. User was deleted from database
3. MongoDB connection issues
4. Wrong user ID in token

**Solutions:**
1. Login again to get a fresh token
2. Check MongoDB connection
3. Use development test token: `Bearer dev-test-token`
4. Verify the user exists in database

### Issue: "Not authorized, no token"
**Solution:** Add Authorization header with valid token

### Issue: "Token expired"
**Solution:** Login again to get a new token

### Issue: "Invalid token"
**Solution:** Check token format and ensure it's valid

### Issue: "Order not found"
**Solution:** Use clean order ID format: `ORD00001` (no # prefix)

## ✅ Success Checklist

- [ ] Server is running on port 5000
- [ ] Health check returns "ok"
- [ ] Phone login returns a valid token
- [ ] Protected routes work with token
- [ ] Profile can be retrieved and updated
- [ ] Order routes use clean order IDs (ORD00001 format)
- [ ] No "User not found in database" errors
- [ ] No "Order not found" errors

## 🎉 You're Ready!

Your API is working correctly. The "User not found in database" error was likely due to:
1. Missing or invalid authorization token
2. Expired token
3. Not following the authentication flow
4. Using wrong order ID format

**Remember: Always use clean order IDs without the # prefix: `ORD00001`, `ORD00002`, etc.**

Follow the steps above and you should be able to test all routes successfully in Postman! 