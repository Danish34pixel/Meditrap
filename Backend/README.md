# MedTrap Backend API

A comprehensive backend API for the MedTrap medical store application, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Medical Store Management**: Complete CRUD operations for medical stores and owners
- **Stockist Management**: Manage medical distributors and their information
- **Company Management**: Pharmaceutical company profiles and details
- **Medicine Management**: Comprehensive medicine database with search and filtering
- **File Upload**: Image upload functionality for licenses and medicine images
- **Rating & Review System**: User ratings and reviews for medicines, companies, and stockists
- **Advanced Search**: Full-text search with multiple filters and pagination
- **Statistics & Analytics**: Comprehensive dashboard statistics for admin users

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Compression**: Compression middleware

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/medtrap
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Users (Admin Only)

- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user
- `PUT /api/user/:id/verify` - Verify user
- `GET /api/user/stats/overview` - User statistics

### Stockists

- `GET /api/stockist` - Get all stockists (with filters)
- `GET /api/stockist/:id` - Get stockist by ID
- `POST /api/stockist` - Create stockist (Admin only)
- `PUT /api/stockist/:id` - Update stockist (Admin only)
- `DELETE /api/stockist/:id` - Delete stockist (Admin only)
- `POST /api/stockist/:id/rate` - Rate stockist
- `GET /api/stockist/stats/overview` - Stockist statistics (Admin only)

### Companies

- `GET /api/company` - Get all companies (with filters)
- `GET /api/company/:id` - Get company by ID
- `POST /api/company` - Create company (Admin only)
- `PUT /api/company/:id` - Update company (Admin only)
- `DELETE /api/company/:id` - Delete company (Admin only)
- `POST /api/company/:id/rate` - Rate company
- `PUT /api/company/:id/verify` - Verify company (Admin only)
- `GET /api/company/stats/overview` - Company statistics (Admin only)

### Medicines

- `GET /api/medicine` - Get all medicines (with filters)
- `GET /api/medicine/:id` - Get medicine by ID
- `POST /api/medicine` - Create medicine (Admin only)
- `PUT /api/medicine/:id` - Update medicine (Admin only)
- `DELETE /api/medicine/:id` - Delete medicine (Admin only)
- `POST /api/medicine/:id/review` - Add review to medicine
- `PUT /api/medicine/:id/stock` - Update medicine stock
- `GET /api/medicine/stats/overview` - Medicine statistics (Admin only)

### File Upload

- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `GET /api/upload` - Get all uploaded files
- `GET /api/upload/:filename` - Get file info
- `DELETE /api/upload/:filename` - Delete uploaded file

## Database Models

### User

- Medical store information
- Owner details
- Address and contact information
- Drug license details
- Role-based access control

### Stockist

- Distributor information
- Contact details and address
- Specializations and delivery areas
- Rating system
- Associated companies and medicines

### Company

- Pharmaceutical company profiles
- License information
- Specializations and certifications
- Rating system
- Associated medicines and stockists

### Medicine

- Comprehensive medicine details
- Composition and dosage information
- Pricing (MRP, trade, retail)
- Stock management
- Reviews and ratings
- Prescription requirements

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permission levels for users
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing protection
- **Helmet Security**: Security headers and protection
- **Password Hashing**: Bcrypt password encryption

## Search & Filtering

All list endpoints support:

- **Text Search**: Full-text search across relevant fields
- **Pagination**: Page-based pagination with configurable limits
- **Sorting**: Multiple sort fields and orders
- **Filtering**: Category, location, rating, and other filters
- **Advanced Queries**: Complex MongoDB aggregation queries

## Error Handling

- **Consistent Error Format**: Standardized error response structure
- **Validation Errors**: Detailed validation error messages
- **Custom Error Classes**: Extensible error handling system
- **Global Error Middleware**: Centralized error processing

## Development

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Code Structure

```
backend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## API Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10,
  "pagination": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Configurable**: Adjustable limits in server configuration
- **Per-route**: Different limits for different endpoints

## File Upload

- **Supported Formats**: Images (JPG, PNG, GIF)
- **File Size Limit**: 5MB (configurable)
- **Storage**: Local file system with unique naming
- **Security**: File type validation and size restrictions

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Environment Variables

- Set `NODE_ENV=production`
- Configure production MongoDB URI
- Set secure JWT secret
- Configure CORS origins

### Production Considerations

- Use PM2 or similar process manager
- Set up reverse proxy (Nginx)
- Configure SSL/TLS certificates
- Set up monitoring and logging
- Use environment-specific configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
