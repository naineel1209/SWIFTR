# SWIFTR

A comprehensive service marketplace platform that connects service providers with customers. SWIFTR enables users to discover, book, and review various local services while providing a seamless experience for both service providers and consumers.

## Features

### For Customers
- **Service Discovery**: Browse and search through various service categories including cleaning, plumbing, electrician, carpentry, and more
- **Advanced Search**: Filter services by category, price, and keywords
- **Shopping Cart**: Add multiple services to cart for streamlined booking
- **Secure Payments**: Integrated Stripe payment gateway for safe transactions
- **Reviews & Ratings**: Read and write reviews to help make informed decisions
- **Order Tracking**: Monitor order status and delivery dates
- **User Profiles**: Manage personal information and view order history

### For Service Providers
- **Service Listings**: Create and manage service offerings with descriptions and pricing
- **Image Uploads**: Showcase services with Cloudinary-powered image hosting
- **Provider Dashboard**: Track bookings and manage service availability
- **Reviews Management**: Receive and respond to customer feedback

### For Administrators
- **User Management**: Oversee platform users and their roles
- **Service Moderation**: Review and manage service listings
- **Analytics**: Monitor platform activity and transactions

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - ODM for MongoDB
- **Redis** - Session storage and caching

### Authentication & Security
- **Passport.js** - Authentication middleware
- **passport-local-mongoose** - Local authentication strategy
- **express-session** - Session management
- **connect-redis** - Redis session store
- **xss-clean** - XSS protection

### File Handling & Media
- **Cloudinary** - Cloud-based image management
- **Multer** - File upload handling
- **express-fileupload** - File upload middleware

### Payment Processing
- **Stripe** - Payment processing and checkout

### Templating & Views
- **EJS** - Embedded JavaScript templating

### Additional Technologies
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **connect-flash** - Flash messages
- **method-override** - HTTP verb support
- **date-fns** - Date manipulation

## Architecture

SWIFTR follows an MVC (Model-View-Controller) architecture pattern:

- **Models**: Define data schemas for Users, Services, Orders, Reviews, Carts, and Bookings
- **Routes**: Handle API endpoints and application routing
- **Middlewares**: Manage authentication, authorization, error handling, and request processing
- **Views**: EJS templates for server-side rendering

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn** package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SWIFTR
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Server Configuration
   PORT=5000
   BASE_URL=http://localhost:5000

   # Database
   MONGO_URI=mongodb://localhost:27017/swiftr

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Stripe Configuration
   STRIPE_SERVER_KEY=your_stripe_secret_key
   ENDPOINT_SECRET=your_stripe_webhook_secret

   # Session Secret
   SESSION_SECRET=your_session_secret_key
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Start Redis**
   ```bash
   redis-server
   ```

6. **Run the application**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:5000`

## Database Schema

### User Schema
- Username, email, password (hashed)
- Role (user, provider, admin)
- Contact information (phone, address, city, state)
- Timestamps

### Service Schema
- Name, description, category
- Price and image
- Associated provider (User reference)
- Average rating and number of reviews
- Timestamps

### Order Schema
- Order items (array of services)
- User reference
- Subtotal, convenience fee, and total
- Payment status and Stripe session ID
- Delivery date
- Timestamps

### Review Schema
- Rating and comment
- Associated service and user references
- Timestamps

### Cart Schema
- User reference
- Services and quantities
- Timestamps

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `GET /logout` - User logout

### Services (`/api/v1/services`)
- `GET /` - Get all services (supports search and filters)
- `POST /` - Create a new service (Provider/Admin only)
- `GET /:id` - Get single service details
- `PATCH /:id` - Update service (Provider/Admin only)
- `DELETE /:id` - Delete service (Provider/Admin only)

### Reviews (`/api/v1/reviews`)
- Review management endpoints for authenticated users

### Cart (`/api/v1/getCart`)
- `GET /` - Get user's cart items

### Orders (`/api/v1/stripe`)
- `POST /checkout` - Create Stripe checkout session
- `POST /webhook` - Handle Stripe webhook events

### User Profile (`/api/v1/my-profile`)
- Profile management endpoints for authenticated users

### Image Upload
- `POST /api/v1/uploadImage` - Upload service images

## Project Structure

```
SWIFTR/
├── app.js                 # Main application entry point
├── package.json           # Project dependencies and scripts
├── ecosystem.config.js    # PM2 configuration
├── db/
│   └── connectDB.js      # Database connection logic
├── models/               # Mongoose schemas
│   ├── Users.js
│   ├── Services.js
│   ├── Orders.js
│   ├── Reviews.js
│   ├── Carts.js
│   └── Bookings.js
├── routes/               # Express route handlers
│   ├── authRoutes.js
│   ├── servicesRoutes.js
│   ├── reviewsRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── myProfileRoutes.js
│   └── indexRoutes.js
├── middlewares/          # Custom middleware
│   ├── errorHandler.js
│   ├── isLoggedIn.js
│   └── notFound.js
├── errors/               # Custom error classes
├── views/                # EJS templates
├── public/               # Static assets
│   ├── images/
│   └── stylesheets/
└── tmp/                  # Temporary file storage
```

## Service Categories

SWIFTR supports the following service categories:

- Cleaning
- Plumbing
- Electrician
- Carpentry
- Gardening
- Painting
- Pest Control
- Beauty
- Fitness
- Tutoring
- Photography
- Repair
- Handyman
- Moving
- Massage
- Therapy
- Other

## User Roles

The platform supports three distinct user roles:

1. **User**: Can browse services, make bookings, and write reviews
2. **Provider**: Can create and manage service listings in addition to user capabilities
3. **Admin**: Has full platform access including user management and service moderation

## Security Features

- Password hashing with passport-local-mongoose
- Session-based authentication with Redis store
- XSS attack prevention with xss-clean middleware
- HTTP-only cookies for session security
- CORS configuration for API security
- Input validation and sanitization

## Development & Deployment

### Running with PM2

The project includes PM2 configuration for production deployment:

```bash
pm2 start ecosystem.config.js
```

This will start both the application server and Redis server.

### Environment Modes

- **Development**: Uses local MongoDB and Redis instances
- **Production**: Configured via PM2 with auto-restart capabilities

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- Built with Express.js and MongoDB
- Payment processing powered by Stripe
- Image hosting by Cloudinary
- Session management with Redis

---

**Note**: Make sure to configure all environment variables before running the application. Never commit your `.env` file to version control.
