# Project: Second Brain API

## Overview
This project is a backend API for managing and sharing content, referred to as "Second Brain." It includes features for user authentication, adding and managing content, generating shareable links, and fetching shared content.

> **Note**: This project was created as part of practice for Harkirat Singh's Web Development Cohort 3.

## Features
1. **User Authentication**:
   - Signup and Signin using JWT-based authentication.

2. **Content Management**:
   - Add, retrieve, and delete user-specific content.

3. **Shareable Links**:
   - Create links to share user content securely.

4. **Fetch Shared Content**:
   - Retrieve content shared by other users.

## API Endpoints

### Authentication
1. **POST /api/v1/auth/signup**
   - User registration.

2. **POST /api/v1/auth/signin**
   - User login.

### Content Management
1. **POST /api/v1/content**
   - Add new content.
   - Requires authentication.

2. **GET /api/v1/content**
   - Retrieve user content.
   - Requires authentication.

3. **DELETE /api/v1/content**
   - Delete specific content.
   - Requires authentication.

### Shareable Links
1. **POST /api/v1/brain/share**
   - Create a shareable link for user content.
   - Requires authentication.

2. **GET /api/v1/brain/:shareLink**
   - Fetch shared content using a shareable link.

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```env
   MONGO_URI="your_mongo_connection_string"
   SECRET_KEY="your_secret_key"
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## Project Structure
```
.
├── src
│   ├── index.ts         # Main application file
│   ├── routesV1.ts      # Routes for version1
│   ├── middleware.ts    # Middleware for authentication
│   ├── db.ts            # Database models and connection
│
├── .env                 # Environment variables
├── package.json         # Project dependencies and scripts
├── README.md            # Project documentation
```

## Technologies Used
- **TypeScript**: For type-safe and scalable backend development.
- **Node.js**: JavaScript runtime for backend development.
- **Express**: Web framework for building APIs.
- **MongoDB**: NoSQL database for data storage.
- **Mongoose**: ODM for MongoDB.
- **jsonwebtoken**: For authentication and authorization.
- **dotenv**: To manage environment variables.

## Notes
- Ensure MongoDB is running and accessible via the provided `MONGO_URI`.
- Use tools like Postman or cURL to test API endpoints.
- Replace `your_mongo_connection_string` and `your_secret_key` with appropriate values in `.env`.
