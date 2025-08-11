# Public Endpoints Setup Guide

This guide explains how to set up and use the public endpoints for delivery charges and tax settings in the Uthraa Naturals backend.

## 🎯 Overview

The public endpoints provide delivery charges and tax settings data to the frontend without requiring authentication. This allows all users (logged in or not) to access pricing information.

## 📁 Files Created/Modified

### New Files:
- `routes/public.js` - Public routes for delivery charges and tax settings
- `seedPricingData.js` - Script to seed initial pricing data
- `test-public-endpoints.js` - Test script to verify endpoints
- `PUBLIC_ENDPOINTS_SETUP.md` - This setup guide

### Modified Files:
- `server.js` - Added public routes
- `package.json` - Added seed and test scripts

## 🚀 Setup Instructions

### 1. Start the Server
```bash
cd SERVER
npm run dev
```

### 2. Seed Initial Data
```bash
npm run seed
```

This will create:
- Default delivery charges (0-1000g: Free, 1000-5000g: ₹100, etc.)
- Default tax settings (GST: 18%, CGST: 9%, SGST: 9%)

### 3. Test the Endpoints
```bash
npm run test:endpoints
```

## 🌐 Available Endpoints

### 1. GET /public/delivery-charges
Returns delivery charges based on weight ranges.

**Response:**
```json
{
  "charges": [
    {
      "id": 1,
      "minWeight": 0,
      "maxWeight": 1000,
      "charge": 0,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "minWeight": 1000,
      "maxWeight": 5000,
      "charge": 100,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. GET /public/tax-settings
Returns current tax settings.

**Response:**
```json
{
  "settings": {
    "gst": 18,
    "cgst": 9,
    "sgst": 9,
    "isActive": true,
    "_id": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. GET /public/pricing-data
Returns both delivery charges and tax settings in one request.

**Response:**
```json
{
  "deliveryCharges": {
    "charges": [...]
  },
  "taxSettings": {
    "settings": {...}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📊 MongoDB Collections

### DeliveryCharges Collection
```javascript
{
  _id: ObjectId,
  charges: [
    {
      minWeight: Number,
      maxWeight: Number | null,
      charge: Number,
      isActive: Boolean
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### TaxSettings Collection
```javascript
{
  _id: ObjectId,
  gst: Number,
  cgst: Number,
  sgst: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Frontend Integration

The frontend is already configured to use these endpoints:

### Delivery Charges Service
```javascript
// frontend/src/services/deliveryChargesService.js
const response = await fetch(`${API_BASE_URL}/public/delivery-charges`);
```

### Tax Service
```javascript
// frontend/src/services/taxService.js
const response = await fetch(`${API_BASE_URL}/public/tax-settings`);
```

## 🧪 Testing

### Manual Testing with curl
```bash
# Test delivery charges
curl https://uthraa-naturals.onrender.com/public/delivery-charges

# Test tax settings
curl https://uthraa-naturals.onrender.com/public/tax-settings

# Test combined pricing data
curl https://uthraa-naturals.onrender.com/public/pricing-data
```

### Automated Testing
```bash
npm run test:endpoints
```

## 🔍 Monitoring

The frontend includes comprehensive monitoring:

### MongoDB Data Service
```javascript
// Test connection
const connectionTest = await mongoDBDataService.testMongoDBConnection();

// Get status
const status = await mongoDBDataService.getMongoDBStatus();

// Validate data
const validation = mongoDBDataService.validateMongoDBData();
```

## 🛠️ Admin Management

Admins can manage delivery charges and tax settings through:

- **Admin Panel**: `/admin/finance` - Manage delivery charges and tax settings
- **API Endpoints**: `/api/admin/delivery-charges` and `/api/admin/tax-settings`

## 🔄 Data Flow

1. **Admin Updates**: Admin changes delivery charges/tax settings via admin panel
2. **MongoDB Storage**: Changes are saved to MongoDB collections
3. **Public Access**: Frontend fetches latest data from public endpoints
4. **Real-time Updates**: Cart and pricing calculations update automatically

## 🚨 Error Handling

### Fallback Data
If MongoDB is unavailable, the endpoints return default data:

**Default Delivery Charges:**
- 0-1000g: Free
- 1000-5000g: ₹100
- 5000-10000g: ₹200
- 10000g+: ₹300

**Default Tax Settings:**
- GST: 18%
- CGST: 9%
- SGST: 9%

### Error Responses
```json
{
  "success": false,
  "message": "Failed to fetch delivery charges",
  "error": "Database connection error"
}
```

## 📈 Performance

- **Caching**: Frontend caches data to reduce API calls
- **Parallel Loading**: Both delivery charges and tax settings load simultaneously
- **Lazy Loading**: Data loads only when needed
- **Validation**: Data integrity checks ensure reliable pricing

## 🔐 Security

- **No Authentication Required**: Public endpoints are accessible to all users
- **Read-Only**: Public endpoints only provide data, no modifications
- **Input Validation**: All data is validated before processing
- **Error Sanitization**: Error messages don't expose sensitive information

## 🎯 Benefits

1. **Universal Access**: All users can access pricing information
2. **Real-time Updates**: Pricing updates immediately when admin changes settings
3. **Reliable Fallbacks**: System works even if database is temporarily unavailable
4. **Comprehensive Monitoring**: Full visibility into data loading and validation
5. **Easy Testing**: Automated tests ensure endpoints work correctly

## 🚀 Deployment

### Production Setup
1. Ensure MongoDB is running and accessible
2. Run seed script: `npm run seed`
3. Test endpoints: `npm run test:endpoints`
4. Monitor logs for any issues

### Environment Variables
```bash
MONGODB_URI=mongodb://your-mongodb-uri
NODE_ENV=production
```

## 📞 Support

If you encounter issues:

1. Check MongoDB connection
2. Verify data exists in collections
3. Run test script: `npm run test:endpoints`
4. Check server logs for errors
5. Validate frontend API configuration

---

**🎉 Setup Complete!** Your public endpoints are now ready to serve delivery charges and tax settings to the frontend. 