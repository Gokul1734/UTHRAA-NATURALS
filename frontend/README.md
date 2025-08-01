# Uthraa Naturals Frontend

A modern, responsive e-commerce frontend for Uthraa Naturals built with React, Vite, and Tailwind CSS.

## Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Product Catalog**: Browse products with advanced filtering and search
- **Shopping Cart**: Add/remove items with real-time updates
- **User Authentication**: Secure login and registration system
- **Product Details**: Detailed product pages with reviews and ratings
- **Responsive Design**: Works perfectly on all devices
- **State Management**: Redux Toolkit for efficient state management
- **Real-time Updates**: Live cart updates and notifications

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios

## Getting Started

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

5. Open your browser and visit `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navbar, Footer)
│   ├── products/       # Product-related components
│   └── categories/     # Category-related components
├── pages/              # Page components
├── store/              # Redux store configuration
│   └── slices/         # Redux slices
├── assets/             # Static assets
└── App.jsx             # Main App component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Components

### Navbar
- Responsive navigation with mobile menu
- Search functionality
- User authentication status
- Shopping cart indicator

### Home Page
- Hero section with call-to-action
- Featured products showcase
- Category browsing
- Customer testimonials

### Products Page
- Advanced filtering and search
- Grid/List view toggle
- Pagination
- Price range filtering
- Category filtering

### Product Cards
- Product images with hover effects
- Price and discount display
- Quick add to cart
- Wishlist functionality
- Rating display

## State Management

The app uses Redux Toolkit for state management with the following slices:

- **authSlice**: User authentication and profile
- **cartSlice**: Shopping cart functionality
- **productSlice**: Product data and filtering
- **categorySlice**: Category management
- **orderSlice**: Order management

## Styling

The project uses Tailwind CSS for styling with:

- Custom color scheme (green theme)
- Responsive design utilities
- Custom animations and transitions
- Component-based styling approach

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api` with endpoints for:

- Authentication (`/auth`)
- Products (`/products`)
- Categories (`/categories`)
- Orders (`/orders`)
- Users (`/users`)

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Build for Production

```bash
npm run build
```

The build files will be created in the `dist` directory.

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Features to Implement

- [ ] Complete shopping cart functionality
- [ ] Checkout process
- [ ] Order tracking
- [ ] User profile management
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Advanced search filters

## License

This project is licensed under the MIT License.
