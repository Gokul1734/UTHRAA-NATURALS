# Uthraa Naturals - E-Commerce Platform

A complete e-commerce solution for Uthraa Naturals, featuring a modern React frontend and a robust Node.js backend with MongoDB.

## 🌟 Features

### Frontend (React + Vite)
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Product Catalog**: Advanced filtering, search, and pagination
- **Shopping Cart**: Real-time cart management with localStorage
- **User Authentication**: Secure login/registration system
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: Redux Toolkit for efficient state handling
- **Real-time Updates**: Live notifications and cart updates

### Backend (Node.js + Express + MongoDB)
- **RESTful API**: Complete CRUD operations for all entities
- **Authentication**: JWT-based authentication with bcrypt
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Input validation and sanitization
- **File Upload**: Support for product images
- **Search & Filtering**: Advanced product search capabilities
- **Order Management**: Complete order lifecycle

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd SERVER
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/uthraa-naturals
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running at `https://uthraa-naturals.onrender.com`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be running at `http://localhost:5173`

## 📁 Project Structure

```
Uthraa Naturals/
├── SERVER/                 # Backend API
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── index.js           # Main server file
│   └── package.json       # Backend dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   └── App.jsx        # Main app component
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: validator.js
- **File Upload**: multer

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Mark order as paid
- `PUT /api/orders/:id/deliver` - Mark order as delivered (Admin)

## 🎨 UI Components

### Key Features
- **Responsive Navbar**: Mobile-friendly navigation with search
- **Hero Section**: Eye-catching landing page with CTA
- **Product Grid**: Beautiful product cards with hover effects
- **Filter System**: Advanced filtering and sorting
- **Shopping Cart**: Real-time cart updates
- **User Dashboard**: Profile and order management
- **Footer**: Comprehensive site information

### Design System
- **Color Scheme**: Green theme representing nature and organic products
- **Typography**: Clean, readable fonts
- **Animations**: Smooth transitions and micro-interactions
- **Icons**: Consistent iconography with Lucide React

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uthraa-naturals
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=https://uthraa-naturals.onrender.com/api
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to platforms like:
   - Heroku
   - Railway
   - DigitalOcean
   - AWS

### Frontend Deployment
1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy to platforms like:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Proper cross-origin resource sharing
- **Error Handling**: Secure error responses

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🧪 Testing

### Backend Testing
```bash
cd SERVER
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Vite](https://vitejs.dev/) - Build tool

## 📞 Support

For support and questions:
- Email: info@uthraanaturals.com
- Website: www.uthraanaturals.com

---

**Made with ❤️ for Uthraa Naturals** 