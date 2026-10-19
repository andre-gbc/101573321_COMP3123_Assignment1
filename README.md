# COMP 3123 Assignment 1 — Backend

A REST API for user registration, login, and employee management. Each user can access only employees they created.

## Technologies

- Node.js and Express
- MongoDB Atlas and Mongoose
- JWT and bcryptjs
- Helmet, express-rate-limit, and express-validator
- Postman

## Project structure

- `server.js` — server setup, health check, rate limiting, and error handling
- `models/` — User and Employee models
- `routes/` — user and employee API routes
- `middleware/` — JWT authentication
- `utils/` — local logging
- `logs/` — generated application log

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/101573321_COMP3123_Assignment1.git
   cd 101573321_COMP3123_Assignment1
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file using `.env.example` as a guide:

   ```env
   PORT=3000
   MONGODB_URI=your_atlas_connection_string
   JWT_SECRET=your_long_random_secret
   ```

   The MongoDB connection string must use the database name `comp3123_assignment1`. Create a MongoDB Atlas database user and allow the connecting IP address in the Atlas network access list.

4. Start the application:

   ```bash
   node server.js
   ```

5. Import the Postman collection JSON file into Postman to test the API.

Do not commit `.env` or real credentials.

## API endpoints

| Method | URL | Purpose | Success |
| --- | --- | --- | --- |
| GET | `/health` | Check server status | 200 |
| POST | `/api/v1/user/signup` | Register a user | 201 |
| POST | `/api/v1/user/login` | Log in with a username or email | 200 |
| GET | `/api/v1/emp/employees` | List the logged-in user's employees | 200 |
| POST | `/api/v1/emp/employees` | Create an employee | 201 |
| GET | `/api/v1/emp/employees/:eid` | Get an employee by ID | 200 |
| PUT | `/api/v1/emp/employees/:eid` | Update an employee | 200 |
| DELETE | `/api/v1/emp/employees?eid=xxx` | Delete an employee | 204 |

The health check returns:

```json
{ "status": "ok" }
```

## Authentication and authorization

Register through signup, then log in with a username or email and password. Login returns a JWT valid for one hour. Send it with every employee request:

```text
Authorization: Bearer YOUR_TOKEN
```

In the Postman collection, set the `token` variable to the login token and `employeeId` to the employee's `_id`. Use the variable's current value for local testing.

Each employee stores a reference to the user who created it. The server takes the owner ID from the verified token and checks ownership for employee operations. An attempt to access another user's employee returns 403.

## Security

- Passwords are hashed with bcryptjs before storage and are not returned in API responses.
- JWTs protect employee endpoints.
- Helmet adds HTTP security headers.
- Signup and login are limited to 10 requests per minute per IP address. Additional requests receive 429.
- express-validator checks user and employee input.
- Secrets are stored in environment variables, not in source code.
- Rate-limit test: Sending more than 10 login requests within one minute returned 429 Too Many Requests.

## Logging

The application creates `logs/application.log` locally. It records timestamps, request methods, paths, response statuses, server startup, and application errors. It does not log request bodies, passwords, JWTs, or database credentials. The generated logs are excluded from Git.

## Testing

Test the requests using the included Postman collection. The following non-sensitive test accounts were used for local testing:

| Username | Email | Password |
| --- | --- | --- |
| usera | usera@example.com | TestPass123 |
| userb | userb@example.com | TestPass456 |

These accounts must be created in the database being used for testing.

The API uses 400 for invalid input, 401 for missing or invalid authentication, 403 for another user's employee, 404 for missing resources, 409 for duplicate users, 429 for rate limits, and 500 for unexpected errors.