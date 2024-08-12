
# Project Name

## Description

This project is a [NestJS](https://nestjs.com/) application that includes a fully-featured backend service with authentication, movie management, and watchlist functionality. The application is built with TypeScript, uses PostgreSQL as the database, and integrates with external APIs like TMDB (The Movie Database). The project also includes Redis for caching purposes.

## Project Structure

```plaintext
├── src
│   ├── app.module.ts          # Root module of the application
│   ├── app.controller.ts      # Main controller (entry point for routes)
│   ├── app.service.ts         # Main service containing core business logic
│   ├── auth                   # Authentication module (login, signup, JWT)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto                # Data Transfer Objects for authentication
│   │   ├── repository         # Repository pattern implementation for authentication
│   │   └── strategies         # Passport strategies (JWT)
│   ├── movie                  # Movie module (CRUD operations)
│   │   ├── movie.controller.ts
│   │   ├── movie.service.ts
│   │   ├── dto                # Data Transfer Objects for movie-related operations
│   │   ├── repository         # Repository pattern implementation for movie module
│   │   └── rating.service.ts  # Service to handle movie ratings
│   ├── watchlist              # Watchlist module (manage user watchlists)
│   │   ├── watchlist.controller.ts
│   │   ├── watchlist.service.ts
│   │   ├── repository         # Repository pattern implementation for watchlist module
│   └── prisma                 # Prisma ORM configuration and client
│       ├── prisma.module.ts
│       ├── prisma.service.ts
├── test                       # Unit and integration tests
│   ├── app.e2e-spec.ts        # Example end-to-end test
│   └── movie.service.spec.ts  # Unit test for MovieService
├── docker-compose.yml         # Docker Compose configuration for the application
├── Dockerfile                 # Dockerfile for building the application image
├── jest.config.js             # Jest configuration for running tests
└── README.md                  # This README file

## Prerequisites

Before running the project, ensure that you have the following tools installed:

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (v14 or above)
- [npm](https://www.npmjs.com/)

## Running the Application with Docker

The application can be easily run using Docker and Docker Compose. The `docker-compose.yml` file sets up the necessary services, including the NestJS application, PostgreSQL, and Redis.

### Step 1: Build the Docker Images

First, build the Docker images using the following command:

```bash
docker-compose build
```

### Step 2: Start the Application

Start the application with Docker Compose:

```bash
docker-compose up
```

This command will start the NestJS application on port `8080`, PostgreSQL on port `5432`, and Redis on port `6379`.

### Step 3: Access the Application

Once the containers are up and running, you can access the application at `http://localhost:8080`.

## Swagger Documentation

The application includes Swagger for API documentation. Once the application is running, you can access the Swagger UI at:

```
http://localhost:8080/api
```

This provides an interactive interface to explore and test the API endpoints.

## Using the API

### Step 1: Sign Up

To start using the application, you first need to create a new user account by signing up. You can do this using the following POST API:

```
POST /auth/signUp
```

**Request Body Example:**

```json
{
  "email": "user@example.com",
  "hash": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Step 2: Log In

After signing up, log in to obtain an access token:

```
POST /auth/login
```

**Request Body Example:**

```json
{
  "email": "user@example.com",
  "hash": "password123"
}
```

**Response Example:**

```json
{
  "accessToken": "your_jwt_token_here"
}
```

### Step 3: Use the API with the Access Token

After logging in, you can use the access token to authenticate your requests to other protected endpoints. Add the access token to the `Authorization` header of your requests:

**Example Authorization Header:**

```plaintext
Authorization: Bearer your_jwt_token_here
```

### Example of Using a Protected Endpoint

To create a new movie in the system:

```
POST /movies/sync
```


**Remember** to include your access token in the `Authorization` header.

## Running Tests and Coverage

The project uses Jest as the testing framework. Tests can be run using npm scripts.

### Step 1: Install Dependencies

Before running tests, make sure you have installed the project dependencies:

```bash
npm install
```

### Step 2: Run Unit Tests

To run all unit tests, use the following command:

```bash
npm run test
```

### Step 3: Run Tests with Coverage

To run tests with coverage reporting, use:

```bash
npm run test -- --coverage
```

The coverage report will be generated in the `coverage` directory. You can open `coverage/lcov-report/index.html` in a web browser to view the detailed coverage report.

## Environment Variables

The application requires several environment variables to run. These can be set in a `.env` file in the root directory or passed directly to Docker via `docker-compose.yml`.

Here are the required environment variables:

- `DATABASE_URL`: The connection string for the PostgreSQL database.
- `REDIS_HOST`: The hostname for Redis.
- `JWT_SECRET`: The secret key for signing JWT tokens.
- `TMDB_API_KEY`: API key for TMDB integration.

Example `.env` file:

```plaintext
DATABASE_URL=postgresql://postgres:password@localhost:5432/nest
REDIS_HOST=redis
JWT_SECRET=mySecretKey
TMDB_API_KEY=your_tmdb_api_key
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
