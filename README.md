# Sahand Estate

A full-stack real-estate application for browsing, searching, and managing property listings. Users can create accounts, sign in with email or Google, upload listing images to Cloudinary, and create, update, or delete their own listings.

## Features

- Browse recent sale, rental, and offer listings
- Search listings by keyword, type, price, parking, and furnished status
- User registration and email/password authentication
- Google OAuth through Firebase
- Protected profile and listing-management pages
- Create and update property listings
- Upload up to six listing images with Cloudinary
- Listing details, sharing, and contact workflow
- MongoDB persistence with an Express API

## Tech Stack

- **Frontend:** React, Vite, React Router, Redux Toolkit, Tailwind CSS, Swiper
- **Backend:** Node.js, Express 5, Mongoose, JWT, bcryptjs
- **Services:** MongoDB Atlas, Firebase Authentication, Cloudinary

## Project Structure

```text
api/
	config/config.env       API environment variables
	controllers/            Request handlers
	models/                 Mongoose models
	routes/                 Express routes
	utils/                  Authentication and error helpers
	index.js                API and production server entry point

client/client/
	src/components/         Reusable React components
	src/pages/               Application pages
	src/redux/               Redux store and user state
	.env                    Vite environment variables
```

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB connection string
- A Firebase project with Google sign-in enabled
- A Cloudinary upload preset

## Environment Variables

Create `api/config/config.env`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Create `client/client/.env`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

Do not commit private credentials, database passwords, or JWT secrets. Restart Vite after changing client environment variables.

## Installation

Install API dependencies:

```bash
cd api
npm install
```

Install client dependencies:

```bash
cd ../client/client
npm install
```

## Development

Start the API from `api/`:

```bash
npm run dev
```

Start the client in a second terminal from `client/client/`:

```bash
npm run dev
```

The Vite development server normally runs at `http://localhost:5173` and proxies `/api` requests to the API at `http://localhost:3000`.

## Production Build

Build the client from the API directory:

```bash
cd api
npm run build
```

Start the production server:

```bash
npm start
```

The API serves the generated client from `client/client/dist` when that directory exists.

## API Routes

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/google`
- `GET /api/auth/signout`

### Listings

- `GET /api/listing/get` - Search and list properties
- `GET /api/listing/get/:id` - Get one property
- `POST /api/listing/create` - Create a protected listing
- `POST /api/listing/update/:id` - Update an owned listing
- `DELETE /api/listing/delete/:id` - Delete an owned listing

### Users

- `GET /api/user/:id`
- `GET /api/user/listings/:id`
- `POST /api/user/update/:id`
- `DELETE /api/user/delete/:id`

## Checks

Run the client linter:

```bash
cd client/client
npm run lint
```

Run the production build:

```bash
cd ../../api
npm run build
```
