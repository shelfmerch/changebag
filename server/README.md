# CauseBags Server

This is the backend server for the CauseBags application. It provides API endpoints for authentication, user management, and other features required by the CauseBags frontend.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for email notifications

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the server directory with the following variables:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/causebags
   JWT_SECRET=your-jwt-secret

   # Email configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password

   # Admin credentials
   ADMIN_EMAIL=admin@cause.com
   ADMIN_PASSWORD=your-admin-password
   ```

3. Build the TypeScript code:
   ```
   npm run build
   ```

## Running the Server

### Development Mode

```
npm run dev
```

### Production Mode

```
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Profile

- `GET /api/profile` - Get user profile (protected route)

### Admin

- `GET /api/admin` - Admin dashboard data (admin-only route)

## Seeding Admin User

To create an admin user with the credentials specified in the `.env` file:

```
npm run seed
```

## Integration with Frontend

The frontend should be configured to send API requests to the backend. This is done by setting up a proxy in the Vite configuration file.
