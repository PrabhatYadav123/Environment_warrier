# Environment Warrior CMS

A full-stack MERN CMS for an environmental group. It has public pages for visitors and a protected admin panel for creating, editing, drafting, publishing and deleting rich media blog posts.

## Features

- React public site with home, about, blogs, single blog, gallery, videos and contact pages
- Admin login with JWT
- Admin dashboard with blog, draft, like and view analytics
- Blog CRUD with draft/published status
- Rich text editor using React Quill
- Category management
- Search, category filtering and pagination
- Image, video and audio uploads
- Local development uploads by default
- Cloudinary-ready uploads when credentials are added

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios, React Quill
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Multer
- Media: local uploads for testing, Cloudinary for production

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start MongoDB locally, or replace `MONGO_URI` in `server/.env` with your MongoDB Atlas connection string.

4. Seed the admin user and starter content:

```bash
npm run seed
```

Default admin:

- Email: `admin@example.com`
- Password: `admin12345`

5. Run both frontend and backend:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api/health`
- Admin: `http://localhost:5173/admin`

## Cloudinary

For local testing, uploads are saved in `server/uploads` and served from the backend. For hosted production, add these values to `server/.env`:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SERVER_PUBLIC_URL=https://your-backend-url.com
```

When Cloudinary credentials are present, the server uses Cloudinary automatically.

## Firebase Hosting Note

Firebase Hosting can host the React frontend after `npm run build`. The Express API still needs a Node host such as Render, Railway or Firebase Functions. If you want Firebase-only hosting later, move the Express routes into Firebase Functions and set `VITE_API_URL` to the deployed function URL.
