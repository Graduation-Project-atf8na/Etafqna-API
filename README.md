# Etafqna API

## Description

Etafqna API is a RESTful web service designed to handle authentication, user management, categories, subcategories, and products. It supports user role-based authorization and features like file upload (with Cloudinary), XSS and NoSQL injection protection, and rate-limiting. This API is built using Node.js, Express.js, MongoDB, and various middleware for security and validation.

## Features

- **Authentication**: Sign-up, login, password reset, email verification, etc.
- **User management**: View, update, delete users, manage followers, and favorite items.
- **Categories and Subcategories**: Create, update, delete, and manage categories and subcategories with image upload and resizing.
- **Products**: Manage products, including filtering, image upload, and location-based queries.
- **Security**: The app is protected against XSS, NoSQL injection, and parameter pollution. It also uses rate-limiting to mitigate DDoS attacks.




## Endpoints

### Authentication

- **POST** `/api/v1/auth/signup`: Register a new user.
- **POST** `/api/v1/auth/login`: Log in a user.
- **POST** `/api/v1/auth/forgotPassword`: Request a password reset email.
- **POST** `/api/v1/auth/verifyCode`: Verify the reset password code.
- **POST** `/api/v1/auth/resetPassword`: Reset the user's password.

### User Management

- **GET** `/api/v1/users`: Get all users (admin only).
- **GET** `/api/v1/users/me`: Get the current logged-in user.
- **PATCH** `/api/v1/users/updateMe`: Update logged-in user's data.
- **PATCH** `/api/v1/users/follow/:id`: Follow a user.
- **PATCH** `/api/v1/users/favorite/:id`: Mark an item as a favorite.

### Category Management

- **GET** `/api/v1/categories`: Get all categories.
- **POST** `/api/v1/categories`: Create a new category (admin only).
- **PATCH** `/api/v1/categories/:id`: Update a category (admin only).
- **DELETE** `/api/v1/categories/:id`: Delete a category (admin only).

### Subcategory Management

- **GET** `/api/v1/categories/:categoryId/subcategories`: Get all subcategories within a category.
- **POST** `/api/v1/categories/:categoryId/subcategories`: Create a new subcategory (admin only).

### Product Management

- **GET** `/api/v1/products`: Get all products.
- **POST** `/api/v1/products`: Create a new product (admin only).
- **PATCH** `/api/v1/products/:id`: Update a product (admin or owner).
- **DELETE** `/api/v1/products/:id`: Delete a product (admin or owner).
- **GET** `/api/v1/products/searchbyimage`: Search products using an image.

## Middleware

### Security

- **Helmet**: Sets various HTTP headers to secure the app.
- **Rate-Limit**: Limits requests to 3000 per hour from the same IP.
- **Mongo-Sanitize**: Prevents NoSQL injection attacks.
- **XSS-Clean**: Cleans user input from malicious HTML to prevent XSS attacks.
- **HPP**: Prevents HTTP parameter pollution.

### Logging and Parsing

- **Morgan**: Logs incoming requests in development mode.
- **Body-parser**: Parses incoming JSON and URL-encoded request bodies.
  
## Error Handling

The API handles errors globally with a centralized error-handling middleware. Errors are captured and transformed into a structured response using `AppError`.


