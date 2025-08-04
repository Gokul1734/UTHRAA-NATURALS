# Uthraa Naturals - Admin Dashboard Setup

This guide will help you set up the admin dashboard with real database data instead of mock data.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

## Setup Instructions

### 1. Backend Setup

1. **Navigate to the server directory:**
   ```bash
   cd SERVER
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the SERVER directory:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/uthraa-naturals
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB:**
   - **Local MongoDB:** Make sure MongoDB is running on your system
   - **MongoDB Atlas:** Use your Atlas connection string in the MONGODB_URI

5. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```
   This will create:
   - 5 categories (Organic Oils, Herbal Supplements, Natural Skincare, Ayurvedic Products, Organic Spices)
   - 6 products (Coconut Oil, Turmeric Powder, Aloe Vera Gel, Ashwagandha Powder, Organic Honey, Neem Face Wash)
   - 3 users (2 regular users, 1 admin)
   - 2 sample orders

6. **Start the server:**
   ```bash
   npm run dev
   ```
   The server will run on `https://uthraa-naturals.onrender.com`

### 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=https://uthraa-naturals.onrender.com
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### 3. Access Admin Dashboard

1. **Open your browser and go to:** `http://localhost:5173/admin/dashboard`

2. **Login with admin credentials:**
   - Email: `admin@uthraa.com`
   - Password: `admin123`

## Database Structure

### Categories
- Organic Oils
- Herbal Supplements  
- Natural Skincare
- Ayurvedic Products
- Organic Spices

### Sample Products
- **Organic Coconut Oil** - ₹299 (50 in stock)
- **Turmeric Powder** - ₹199 (75 in stock)
- **Aloe Vera Gel** - ₹399 (30 in stock)
- **Ashwagandha Powder** - ₹349 (25 in stock)
- **Organic Honey** - ₹249 (40 in stock)
- **Neem Face Wash** - ₹199 (8 in stock - low stock item)

### Sample Users
- **John Doe** (john@example.com) - Regular user
- **Jane Smith** (jane@example.com) - Regular user  
- **Admin User** (admin@uthraa.com) - Admin user

## Admin Dashboard Features

The dashboard now displays real data from the database:

### Statistics Cards
- **Total Products:** Shows actual count of active products
- **Total Orders:** Shows actual count of all orders
- **Total Users:** Shows count of regular users (excluding admins)
- **Total Revenue:** Shows sum of all paid orders
- **Pending Orders:** Shows count of orders with 'pending' status
- **Low Stock Items:** Shows count of products with stock < 10

### Admin Modules
Click on any module to navigate to the respective management page:
- Product Management
- Category Management
- Order Management
- User Management
- Finance Management
- Stock Management
- Advertisement Management
- Delivery Management
- Reports & Analytics
- System Settings

## API Endpoints

### Dashboard Stats
- `GET /api/dashboard/stats` - Get dashboard statistics

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Users
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user

## Adding New Data

### Adding Categories
1. Go to Category Management
2. Click "Add New Category"
3. Fill in the form with:
   - Name
   - Description
   - Image URL
   - Order (for sorting)

### Adding Products
1. Go to Product Management
2. Click "Add New Product"
3. Fill in the form with:
   - Name
   - Description
   - Price
   - Category
   - Stock quantity
   - Weight and unit
   - Images
   - Product details (ingredients, benefits, etc.)

## Troubleshooting

### Database Connection Issues
- Make sure MongoDB is running
- Check your MONGODB_URI in the .env file
- For MongoDB Atlas, ensure your IP is whitelisted

### API Connection Issues
- Make sure the backend server is running on port 5000
- Check the VITE_API_URL in frontend .env file
- Ensure CORS is properly configured

### Data Not Loading
- Check browser console for errors
- Verify the API endpoints are working
- Ensure the database has been seeded properly

## Development Notes

- The dashboard currently bypasses authentication for development
- Remove the authentication bypass in production
- Add proper error handling and loading states
- Implement proper authentication middleware
- Add image upload functionality for products and categories

## Next Steps

1. Implement proper authentication and authorization
2. Add image upload functionality
3. Create product and category management pages
4. Add order management functionality
5. Implement user management features
6. Add reporting and analytics
7. Set up proper error handling and validation 