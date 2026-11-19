
# StitchFlow

Clothing Alteration Request and Order Tracking System

## Project Overview

StitchFlow is a web-based clothing alteration management
system for customers, tailors, and shop administrators.

This development increment focuses on user account
management, secure authentication, and role-based
dashboards.

## Technologies Used

- ReactJS
- Vite 5
- Spring Boot 4.1.2
- Spring Security
- Spring Data JPA
- Java 21
- Supabase PostgreSQL
- BCrypt Password Hashing
- Git and GitHub

## Implemented Features

### 1. User Account Creation
- Customer registration
- Required-field validation
- Duplicate email prevention
- BCrypt password hashing
- Automatic CUSTOMER role assignment
- Administrator-created Tailor accounts

### 2. Login and Logout
- Email and password authentication
- Secure server-side sessions
- Login error handling
- Logout and session invalidation
- CSRF protection

### 3. Role-Based Dashboards
- Customer Dashboard
- Tailor Dashboard
- Administrator Dashboard
- Role-based navigation
- Protected frontend routes
- Backend role authorization

## Project Structure

StitchFlow/
  backend/    Spring Boot REST API
  web/        ReactJS frontend
  README.md   Project documentation

## System Requirements

- Java JDK 21 or newer compatible version
- Node.js 20.11.0 or compatible version
- Maven Wrapper (included)
- Internet connection
- Supabase PostgreSQL project

## Database Configuration

This project uses a Supabase PostgreSQL database.

Create a Supabase project and obtain the Session
pooler connection details.

Set the following environment variables in
PowerShell before starting the backend:

$env:DB_HOST = "YOUR_SUPABASE_HOST"
$env:DB_PORT = "5432"
$env:DB_USER = "YOUR_SUPABASE_USERNAME"
$env:DB_PASSWORD = "YOUR_DATABASE_PASSWORD"

Do not commit database passwords or credentials.

## Initial Administrator Setup

Before starting the application for the first
time, configure:

$env:STITCHFLOW_ADMIN_EMAIL = "YOUR_ADMIN_EMAIL"

$securePassword = Read-Host "Admin password" -AsSecureString
$env:STITCHFLOW_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password

The password must contain at least 12 characters.

The initial administrator is created only when
no administrator account exists.

## Running the Backend

Open a terminal:

cd backend

Run:

.\mvnw.cmd spring-boot:run

Backend URL:

http://localhost:8080

## Running the Frontend

Open another terminal:

cd web

Install dependencies:

npm install

Start the frontend:

npm run dev

Frontend URL:

http://localhost:5173

## User Roles

### CUSTOMER
- Register and log in
- Access Customer Dashboard
- View account information
- Log out

### TAILOR
- Log in using an administrator-created account
- Access Tailor Dashboard
- View account information
- Log out

### ADMIN
- Access Administrator Dashboard
- Create Tailor accounts
- View account information
- Log out

## Authentication API

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/csrf

## Protected API Endpoints

GET /api/customer/dashboard
GET /api/tailor/dashboard
GET /api/admin/dashboard
POST /api/admin/staff

## Security

Passwords are stored as BCrypt hashes.

Spring Security manages authentication sessions
and role-based access.

Customers cannot register themselves as
Tailors or Administrators.

## Development Scope

This increment covers User Accounts and
Authentication only.

Clothing alteration requests, quotations,
order tracking, and pickup scheduling will
be implemented in later development increments.
