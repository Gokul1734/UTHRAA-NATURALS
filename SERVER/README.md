# Uthraa Naturals Backend API

A Node.js/Express.js backend API for the Uthraa Naturals e-commerce platform.

## Features

- User authentication and authorization
- Product management (CRUD operations)
- Category management
- Order processing
- User management
- JWT-based authentication
- File upload support
- MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SERVER
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**

   **Option A: MongoDB Atlas (Recommended for beginners)**
   
   1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   2. Create a free account
   3. Create a new cluster
   4. Click "Connect" and choose "Connect your application"
   5. Copy the connection string
   6. Update the `.env` file with your MongoDB Atlas URI:
      ```
      MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/uthraa-naturals?retryWrites=true&w=majority
      ```

   **Option B: Local MongoDB Installation**
   
   1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   2. Install MongoDB following the installation guide
   3. Start MongoDB service:
      - Windows: MongoDB should run as a service automatically
      - macOS: `brew services start mongodb-community`
      - Linux: `sudo systemctl start mongod`
   4. The default connection string will work: `mongodb://127.0.0.1:27017/uthraa-naturals`

4. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://127.0.0.1:27017/uthraa-naturals
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Orders
- `GET /api/orders` - Get all orders (admin only)
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Health Check

- `GET /api/health` - Check server and database status

## Troubleshooting

### MongoDB Connection Issues

If you're getting "MongoDB connection timeout" errors:

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   ```

2. **Verify connection string:**
   - Make sure the `.env` file exists and has the correct `MONGODB_URI`
   - For local MongoDB: `mongodb://127.0.0.1:27017/uthraa-naturals`
   - For MongoDB Atlas: Use the connection string from your Atlas dashboard

3. **Test MongoDB connection:**
   ```bash
   # If MongoDB is installed locally
   mongo
   # or
   mongosh
   ```

4. **Check firewall settings:**
   - Make sure port 27017 is not blocked (for local MongoDB)
   - For MongoDB Atlas, make sure your IP is whitelisted

5. **Use MongoDB Atlas (Recommended):**
   - Sign up for free at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster and get the connection string
   - Update your `.env` file with the Atlas connection string

### Common Error Solutions

1. **"MongooseError: Operation buffering timed out"**
   - MongoDB is not running or not accessible
   - Check MongoDB installation and service status
   - Verify connection string in `.env` file

2. **"ECONNREFUSED"**
   - MongoDB service is not running
   - Start MongoDB service or use MongoDB Atlas

3. **"Authentication failed"**
   - Check username/password in MongoDB Atlas connection string
   - Make sure the database user has proper permissions

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production Mode
```bash
npm start
```

### File Structure
```
SERVER/
├── models/          # Mongoose schemas
├── routes/          # API routes
├── middleware/      # Custom middleware
├── uploads/         # File uploads
├── .env            # Environment variables
├── index.js        # Server entry point
└── package.json    # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License. 