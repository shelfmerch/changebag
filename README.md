# changebag

changebag is a web application that allows users to create, sponsor, and claim tote bags for various causes. The application uses React/TypeScript for the frontend and Node.js/Express/MongoDB for the backend.

## Features

- Authentication system with JWT tokens
- Cause management (create, sponsor, claim, waitlist)
- Story sharing functionality
- File upload capabilities for images
- Statistics API
- Payment processing with Razorpay

## MSG91 OTP Verification System

This project uses MSG91 REST APIs for phone number verification through a clean backend-based system.

### Features

- ✅ **No Widget Dependencies**: Completely bypasses MSG91 widget
- ✅ **Backend-Only API Usage**: Uses MSG91 REST APIs directly
- ✅ **Clean UI**: Custom two-step verification process
- ✅ **Reliable Fallback**: Multiple API methods with fallback support
- ✅ **Rate Limiting**: 2-minute cooldown between OTP requests
- ✅ **Security**: OTP hashing and proper phone number standardization

### Configuration

Set these environment variables in your `.env` file:

```env
# MSG91 Configuration
MSG91_AUTH_KEY=383885T2HhO4JY468651dc9P1
MSG91_SENDER_ID=CAUSEC
MSG91_OTP_TEMPLATE_ID=your_template_id_here
```

### How It Works

1. **Phone Input**: User enters phone number
2. **OTP Sending**: Backend calls MSG91 Flow API to send SMS
3. **OTP Input**: User enters 6-digit verification code
4. **Verification**: Backend verifies OTP against stored hash
5. **Success**: User is redirected to confirmation page

### API Endpoints

- `POST /api/otp/send` - Send OTP to phone number
- `POST /api/otp/verify` - Verify OTP code

### Fallback System

If MSG91 configuration is missing:
- OTPs are logged to console instead of sent
- System continues to work for development/testing
- Clear error messages guide users

### Development Notes

- MSG91 widget script is disabled in `index.html`
- Uses standardized phone number format (+91XXXXXXXXXX)
- Comprehensive error handling and logging
- 60-second countdown for resend functionality

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`
5. Test OTP verification flow

## Production Deployment

1. Set proper MSG91 credentials in production environment
2. Ensure MSG91 sender ID is approved
3. Configure MSG91 template ID for OTP messages
4. Deploy with PM2 or your preferred method

## Deployment Instructions

This application is set up for deployment with Netlify (frontend) and Render (backend).

### Frontend Deployment (Netlify)

1. **Sign up/login to Netlify**: Go to [Netlify](https://app.netlify.com/) and sign up or log in with your GitHub account.

2. **Import your GitHub repository**:
   - Click "New site from Git"
   - Select GitHub as your Git provider
   - Authorize Netlify to access your GitHub repositories
   - Select the `sshusain313/changebag` repository

3. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `build` (or `dist` depending on your React setup)
   - Click "Deploy site"

4. **Set up environment variables**:
   - In the Netlify dashboard, go to Site settings > Build & deploy > Environment
   - Add your frontend environment variables (like `REACT_APP_API_URL`)

### Backend Deployment (Render)

1. **Sign up/login to Render**: Go to [Render](https://render.com/) and sign up or log in with your GitHub account.

2. **Create a new Web Service**:
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Select the `sshusain313/changebag` repository

3. **Configure your service**:
   - Name: `changebag-api`
   - Root Directory: `server` (since your backend is in the server directory)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start` (or whatever command starts your Express server)

4. **Set up environment variables**:
   - In the Render dashboard, add your environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret
     - `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`: Email configuration
     - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: Admin credentials
     - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: Payment gateway credentials
     - `PORT`: 10000 (Render will override this with its own port)
     - `NODE_ENV`: production

### Connecting Frontend to Backend

Once your backend is deployed, update the `apiUrl` in the frontend configuration to point to your Render backend URL.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project can be deployed using the instructions provided above for Netlify (frontend) and Render (backend).

## Can I connect a custom domain to my project?

Yes, you can!

To connect a domain, you can configure it through your hosting provider's domain settings.
