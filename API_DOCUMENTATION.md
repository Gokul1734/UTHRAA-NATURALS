# Uthraa Naturals - Admin API Documentation

This document provides comprehensive API documentation for the admin endpoints to manage categories and products.

## Base URL
```
https://uthraa-naturals.onrender.com/api
```

## Authentication
Currently, authentication is bypassed for development. In production, add proper JWT authentication middleware.

## Admin Endpoints

### Dashboard Statistics

#### Get Dashboard Stats
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "totalProducts": 6,
  "totalOrders": 2,
  "totalUsers": 2,
  "totalRevenue": 1247,
  "pendingOrders": 1,
  "lowStockItems": 1,
  "recentProducts": [...],
  "productsByCategory": [...],
  "topProducts": [...],
  "categoryStats": [...]
}
```

#### Get Dashboard Products
```http
GET /api/dashboard/products?limit=12&category=categoryId
```

#### Get Dashboard Categories
```http
GET /api/dashboard/categories
```

### Category Management

#### Get All Categories
```http
GET /api/admin/categories?page=1&limit=10&search=oil&sort=order&order=asc
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in name and description
- `sort` (optional): Sort field (default: order)
- `order` (optional): Sort order - asc/desc (default: asc)

**Response:**
```json
{
  "categories": [
    {
      "_id": "categoryId",
      "name": "Organic Oils",
      "description": "Pure and natural organic oils",
      "image": "https://example.com/image.jpg",
      "order": 1,
      "isActive": true,
      "parentCategory": null,
      "slug": "organic-oils",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 5,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

#### Get Category by ID
```http
GET /api/admin/categories/:id
```

#### Create Category
```http
POST /api/admin/categories
Content-Type: application/json

{
  "name": "New Category",
  "description": "Category description",
  "image": "https://example.com/image.jpg",
  "parentCategory": "parentCategoryId", // optional
  "order": 1, // optional
  "isActive": true // optional
}
```

**Response:**
```json
{
  "message": "Category created successfully",
  "category": {
    "_id": "newCategoryId",
    "name": "New Category",
    "description": "Category description",
    "image": "https://example.com/image.jpg",
    "order": 1,
    "isActive": true,
    "slug": "new-category",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Category
```http
PUT /api/admin/categories/:id
Content-Type: application/json

{
  "name": "Updated Category Name",
  "description": "Updated description",
  "image": "https://example.com/new-image.jpg",
  "order": 2,
  "isActive": false
}
```

#### Delete Category
```http
DELETE /api/admin/categories/:id
```

**Note:** Cannot delete categories that have products or subcategories.

### Product Management

#### Get All Products
```http
GET /api/admin/products?page=1&limit=10&category=categoryId&search=oil&minPrice=100&maxPrice=500&sort=createdAt&order=desc&stockStatus=in_stock
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category ID
- `search` (optional): Search in name and description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order - asc/desc (default: desc)
- `stockStatus` (optional): Filter by stock status - in_stock/out_of_stock/low_stock

**Response:**
```json
{
  "products": [
    {
      "_id": "productId",
      "name": "Organic Coconut Oil",
      "description": "Pure cold-pressed organic coconut oil",
      "price": 299,
      "originalPrice": 399,
      "category": {
        "_id": "categoryId",
        "name": "Organic Oils"
      },
      "images": ["https://example.com/image.jpg"],
      "stock": 50,
      "weight": 500,
      "unit": "ml",
      "ingredients": ["Organic Coconut Oil"],
      "benefits": ["Natural moisturizer", "Healthy cooking oil"],
      "usage": "Use for cooking, skincare, or hair care",
      "isOrganic": true,
      "isVegan": true,
      "isGlutenFree": true,
      "isFeatured": true,
      "isActive": true,
      "tags": ["organic", "coconut", "oil"],
      "ratings": 4.5,
      "numReviews": 10,
      "slug": "organic-coconut-oil",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 6,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

#### Get Product by ID
```http
GET /api/admin/products/:id
```

#### Create Product
```http
POST /api/admin/products
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 299,
  "originalPrice": 399, // optional
  "category": "categoryId",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "stock": 50,
  "weight": 500,
  "unit": "ml", // g, kg, ml, l, pieces, packets
  "ingredients": ["Ingredient 1", "Ingredient 2"], // optional
  "benefits": ["Benefit 1", "Benefit 2"], // optional
  "usage": "Usage instructions", // optional
  "isOrganic": true, // optional
  "isVegan": true, // optional
  "isGlutenFree": true, // optional
  "isFeatured": false, // optional
  "isActive": true, // optional
  "tags": ["tag1", "tag2"], // optional
  "seoTitle": "SEO Title", // optional
  "seoDescription": "SEO Description" // optional
}
```

#### Update Product
```http
PUT /api/admin/products/:id
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 349,
  "stock": 75,
  "isFeatured": true
}
```

#### Delete Product
```http
DELETE /api/admin/products/:id
```

#### Get Products by Category
```http
GET /api/admin/categories/:categoryId/products?page=1&limit=10&sort=createdAt&order=desc
```

## Error Responses

### Validation Error (400)
```json
{
  "message": "Product name is required, Price cannot be negative"
}
```

### Not Found Error (404)
```json
{
  "message": "Product not found"
}
```

### Conflict Error (400)
```json
{
  "message": "Product with this name already exists"
}
```

### Server Error (500)
```json
{
  "message": "Server error"
}
```

## Testing Examples

### Using cURL

#### Create a Category
```bash
curl -X POST https://uthraa-naturals.onrender.com/api/admin/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Category",
    "description": "Test category description",
    "image": "https://example.com/image.jpg",
    "order": 1
  }'
```

#### Create a Product
```bash
curl -X POST https://uthraa-naturals.onrender.com/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test product description",
    "price": 199,
    "category": "categoryId",
    "images": ["https://example.com/image.jpg"],
    "stock": 25,
    "weight": 200,
    "unit": "g",
    "ingredients": ["Test Ingredient"],
    "benefits": ["Test Benefit"],
    "usage": "Test usage instructions",
    "isOrganic": true,
    "isVegan": true,
    "isGlutenFree": true
  }'
```

#### Get Dashboard Stats
```bash
curl -X GET https://uthraa-naturals.onrender.com/api/dashboard/stats
```

### Using JavaScript/Fetch

#### Get All Categories
```javascript
const response = await fetch('https://uthraa-naturals.onrender.com/api/admin/categories?page=1&limit=10');
const data = await response.json();
console.log(data.categories);
```

#### Create a Product
```javascript
const productData = {
  name: "New Product",
  description: "Product description",
  price: 299,
  category: "categoryId",
  images: ["https://example.com/image.jpg"],
  stock: 50,
  weight: 500,
  unit: "ml"
};

const response = await fetch('https://uthraa-naturals.onrender.com/api/admin/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(productData)
});

const result = await response.json();
console.log(result);
```

## Database Schema

### Category Schema
```javascript
{
  name: String (required, unique),
  description: String,
  image: String (required),
  slug: String (auto-generated),
  isActive: Boolean (default: true),
  parentCategory: ObjectId (ref: Category),
  order: Number (default: 0),
  seoTitle: String,
  seoDescription: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  originalPrice: Number,
  category: ObjectId (ref: Category, required),
  images: [String] (required),
  stock: Number (required, default: 0),
  weight: Number (required),
  unit: String (required, enum: ['g', 'kg', 'ml', 'l', 'pieces', 'packets']),
  ingredients: [String],
  benefits: [String],
  usage: String,
  isOrganic: Boolean (default: false),
  isVegan: Boolean (default: false),
  isGlutenFree: Boolean (default: false),
  isFeatured: Boolean (default: false),
  isActive: Boolean (default: true),
  ratings: Number (default: 0),
  numReviews: Number (default: 0),
  reviews: [ReviewSchema],
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  slug: String (auto-generated),
  createdAt: Date,
  updatedAt: Date
}
```

## Notes

1. **Unique IDs**: MongoDB automatically generates unique `_id` fields for all documents
2. **Slugs**: Auto-generated from names for SEO-friendly URLs
3. **Validation**: All required fields are validated on both client and server
4. **Pagination**: All list endpoints support pagination
5. **Search**: Text search is case-insensitive
6. **Filtering**: Multiple filter options available for products
7. **Sorting**: Configurable sorting on multiple fields
8. **Relationships**: Products are linked to categories via ObjectId references 