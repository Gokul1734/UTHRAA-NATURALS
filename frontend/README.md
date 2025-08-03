# Uthraa Naturals - Frontend Application

A modern, responsive e-commerce frontend for Uthraa Naturals built with React, Vite, and Tailwind CSS.

## 🛍️ Customer Application (Main Store)
**Access URL**: `http://localhost:5173/`

The main customer-facing e-commerce application with:
- Product browsing and search
- Shopping cart functionality
- User authentication (login/register)
- Order management
- Customer profile

## 🔧 Admin Application (Admin Panel)
**Access URL**: `http://localhost:5173/admin`

The integrated admin panel for managing:
- Product management
- Category management
- Order management
- User management
- Finance management
- Stock management
- Advertisement management
- Delivery management
- Reports & Analytics
- System settings

## 🚀 Development

### Running the Application
```bash
# Start the development server
npm run dev

# The customer app will be available at:
# http://localhost:5173/

# The admin app will be available at:
# http://localhost:5173/admin
```

### Building for Production
```bash
# Build the application
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx              # Main application with both customer and admin routes
│   ├── pages/
│   │   ├── Home.jsx         # Customer pages
│   │   ├── Products.jsx     # Customer pages
│   │   └── Admin/           # Admin pages
│   │       ├── Dashboard.jsx
│   │       ├── ProductManagement.jsx
│   │       └── CategoryManagement.jsx
│   └── components/
│       ├── layout/
│       │   ├── Navbar.jsx   # Customer navbar
│   │   ├── Footer.jsx   # Customer footer
│   │   └── AdminLayout.jsx  # Admin layout (no navbar/footer)
├── index.html               # Main HTML file
└── vite.config.js           # Vite configuration
```

## 🔐 Admin Access

The admin panel currently has authentication bypassed for development. In production, you should:
1. Enable proper authentication
2. Add role-based access control
3. Secure admin routes
4. Implement proper session management

## 🗺️ Google Maps Integration

The profile page includes address selection with Google Maps integration. To enable this feature:

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables
Create a `.env` file in the frontend directory:
```bash
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend API URL
VITE_API_BASE_URL=http://localhost:5001/api

# Frontend URL
VITE_FRONTEND_URL=http://localhost:5173
```

### 3. Features
- Interactive map for address selection
- Search functionality for addresses
- Reverse geocoding (click on map to get address)
- Automatic address parsing
- Integration with user profile

## 🎨 Features

### Customer App Features:
- ✅ Responsive design for all devices
- ✅ Modern UI with animations
- ✅ Product catalog with search
- ✅ Shopping cart functionality
- ✅ User authentication
- ✅ Order management

### Admin App Features:
- ✅ Integrated admin interface
- ✅ No customer navbar/footer in admin pages
- ✅ Desktop-optimized responsive design
- ✅ Product management
- ✅ Category management
- ✅ Order management
- ✅ User management
- ✅ Finance management
- ✅ Stock management
- ✅ Advertisement management
- ✅ Delivery management
- ✅ Reports & Analytics
- ✅ System settings

## 🛠️ Technology Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and visit:
   - Customer app: `http://localhost:5173/`
   - Admin panel: `http://localhost:5173/admin`

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach** for customer pages
- **Desktop-optimized** admin interface
- **Smooth animations** and transitions
- **Touch-friendly** interactions

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
