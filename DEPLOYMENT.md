# TextRoom Deployment Guide

This document provides instructions for deploying the TextRoom chat application to production environments. The application now supports image sharing, theme customization, and mobile-friendly UI.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Environment Setup](#environment-setup)
4. [Building for Production](#building-for-production)
5. [Deployment Instructions](#deployment-instructions)
   - [Replit Deployment](#replit-deployment)
   - [Vercel Deployment](#vercel-deployment)
   - [Heroku Deployment](#heroku-deployment)
   - [Self-Hosting](#self-hosting)
6. [WebSocket Configuration](#websocket-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Feature Configuration](#feature-configuration)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the application, ensure you have:

- Node.js (version 18.x or higher)
- npm or yarn package manager
- Git for version control
- Access to your chosen hosting platform

## Deployment Options

TextRoom can be deployed using several methods:

1. **Replit** - Easiest option for quick deployment with built-in CI/CD
2. **Vercel** - Good for frontend, may require additional setup for WebSockets
3. **Heroku** - Full-stack deployment with WebSocket support
4. **Self-hosting** - Deploy on your own infrastructure or VPS

## Environment Setup

Create a `.env` file in the root directory with the following variables (adjust as needed):

```
# Server configuration
PORT=5000
NODE_ENV=production

# For custom domains
HOST=your-domain.com
```

## Building for Production

Run the build process before deploying:

```bash
# Install dependencies
npm install

# Build the frontend
npm run build
```

This creates optimized files in the `dist` directory.

## Deployment Instructions

### Replit Deployment

1. Fork this project on Replit
2. In your Replit project, click on the "Deploy" tab
3. Configure the deployment settings
4. Click "Deploy to Production"

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set the output directory to `dist`
3. Add the following build command:
   ```
   npm install && npm run build
   ```
4. Add a Vercel serverless function to handle WebSocket connections:
   ```javascript
   // api/socket.js
   import { Server } from 'socket.io';

   export default (req, res) => {
     if (res.socket.server.io) {
       res.end();
       return;
     }
     
     const io = new Server(res.socket.server);
     res.socket.server.io = io;
     
     // Setup your socket handlers here
     
     res.end();
   };
   ```

### Heroku Deployment

1. Create a new Heroku app
2. Connect your GitHub repository
3. Set the buildpack to Node.js
4. Add the following to your `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   },
   "scripts": {
     "start": "node server/index.js",
     "heroku-postbuild": "npm run build"
   }
   ```
5. Deploy using the Heroku dashboard or CLI:
   ```bash
   git push heroku main
   ```

### Self-Hosting

1. Clone the repository on your server
2. Install dependencies and build the application
   ```bash
   npm install
   npm run build
   ```
3. Use a process manager like PM2 to run the server
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name textroom
   ```
4. Set up Nginx or Apache as a reverse proxy

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## WebSocket Configuration

The TextRoom application uses WebSockets for real-time communication. Some deployment platforms may require additional configuration:

- Ensure your server allows WebSocket connections on the specified port
- For platforms with sleep/idle functionality (like Heroku free tier), implement a ping mechanism to keep the connection alive
- When using a reverse proxy, ensure it's configured to handle WebSocket connections (see Nginx example above)

## Post-Deployment Verification

After deployment, test your application by:

1. Opening the application in multiple browser windows
2. Creating a new room and joining with different usernames
3. Sending messages and verifying they appear in real-time
4. Checking that room information is displayed correctly
5. Verifying that users can join existing rooms via room ID
6. Testing image uploads and sharing between users
7. Verifying dark/light theme switching works properly
8. Testing the application on mobile devices

## Feature Configuration

The TextRoom application includes several key features that can be customized:

### Theme Customization

The application's theme can be modified by editing the `theme.json` file:

```json
{
  "variant": "vibrant", // Options: "professional", "tint", "vibrant"
  "primary": "hsl(210, 100%, 50%)", // Primary color in HSL format
  "appearance": "system", // Options: "light", "dark", "system"
  "radius": 0.6 // Border radius size
}
```

### Image Sharing

Image sharing is enabled by default with the following constraints:
- Maximum file size: 5MB
- Supported formats: JPEG, PNG, GIF
- Images are stored as data URLs (base64 encoded)

To modify these constraints, edit the `handleFileChange` function in `client/src/components/MessageInput.tsx`.

### Mobile Responsiveness

The application is optimized for mobile devices with:
- Responsive layout that adapts to screen size
- Touch-friendly components
- Collapsible sidebar on small screens

## Troubleshooting

Common issues and solutions:

1. **WebSocket connection failures**
   - Check network firewall settings
   - Ensure proxy configurations support WebSockets
   - Verify that the correct WebSocket URL is being used in the client

2. **Application not loading**
   - Check server logs for errors
   - Verify that build files were generated correctly
   - Ensure the server is running and accessible

3. **Database errors**
   - Not applicable (TextRoom uses in-memory storage)

4. **Environment variable issues**
   - Confirm environment variables are properly set in your deployment platform
   - Check for typos in variable names

5. **Image upload failures**
   - Verify file size is under 5MB
   - Ensure the image format is supported (JPEG, PNG, GIF)
   - Check browser console for any JavaScript errors

6. **Theme switching issues**
   - Verify theme.json has valid values
   - Check browser localStorage access permissions
   - Ensure CSS is properly loading

---

For any additional support, please reach out to the development team or open an issue on the project repository.