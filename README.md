# Library Management System

A full-stack Library Management System built with a C# ASP.NET Core (.NET 9.0) backend and a React (Vite) frontend.

## Assumptions and Design Decisions

- **Architecture:** The backend follows a layered architecture, utilizing Repositories for data access and Managers for business logic. This separation of concerns makes the code easier to maintain and test.
- **Database:** PostgreSQL is used as the primary relational database, interfaced via Entity Framework Core (EF Core).
- **File Storage:** Book cover images are stored locally on the server in the `backend/wwwroot/uploads/books` directory for simplicity during local development. In a production environment, this would ideally be migrated to a cloud storage provider (e.g., AWS S3, Azure Blob Storage).
- **Frontend:** Built with React 19 and Vite for a fast and modern developer experience. Client-side routing is handled by `react-router-dom`.

## Environment Configuration

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/download/)

### Database Setup

1. Ensure PostgreSQL is installed and running on your machine.
2. By default, the application attempts to connect with the following credentials:
   - Host: `localhost`
   - Database: `postgres`
   - Username: `postgres`
   - Password: `sajjad`
3. If your PostgreSQL setup requires different credentials, update the `ConnectionStrings:DefaultConnection` in `backend/appsettings.json` (or `backend/appsettings.Development.json`).

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   dotnet restore
   ```
3. Apply database migrations to create the required tables:
   ```bash
   dotnet ef database update
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required npm packages:
   ```bash
   npm install
   ```

## How to Run the Application

To run the full stack, you need to start both the backend and frontend servers in separate terminal windows.

### Starting the Backend

1. Open a terminal and navigate to the `backend` directory.
2. Run the application:
   ```bash
   dotnet run
   ```
3. The backend server will start (usually accessible at `http://localhost:5000` or `https://localhost:5001`).

### Starting the Frontend

1. Open a separate terminal and navigate to the `frontend` directory.
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. The frontend application will start (usually on `http://localhost:5173`). Open this URL in your browser to access the Library Management System.

## Running Tests

### Backend Tests
If a test project (e.g., `backend.Tests`) is added to the solution, you can run the tests using:
```bash
cd backend
dotnet test
```

### Frontend Tests
Currently, the Vite project is set up without a test runner by default. You can run linter checks with:
```bash
cd frontend
npm run lint
```
(If Vitest or Jest is added in the future, you would typically run `npm test`).
