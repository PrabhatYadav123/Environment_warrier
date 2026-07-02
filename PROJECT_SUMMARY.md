# Environment Warrior CMS - Project Summary

This Markdown file should be updated whenever project behavior, setup, routes, or production notes change.

## Project Location

```bash
/Users/prabhatyadav/Desktop/environment-warrior
```

## What Exists

Environment Warrior CMS is a MERN-style blog and media platform with:

- Public pages: Home, About, Blogs, Blog Detail, Gallery, Videos, Contact
- Admin pages: Login, Dashboard, Create/Edit Blog, Manage Blogs, Categories, Users, Profile
- Backend APIs for authentication, blogs, categories, contact messages, analytics, uploads, and user management

## Current Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT with bcrypt password hashing
- Uploads: Multer
- Media: local uploads for development, Cloudinary for production

## Latest Production-Readiness Updates

- Removed default admin email and password from the admin login form.
- Removed fallback default development credentials from the seed flow and env examples.
- Added `npm run create-admin` for explicit first-admin creation.
- Added admin-only user management APIs.
- Added an Admin > Users screen for creating, editing, and deleting admin/author accounts.
- Added safeguards against deleting the logged-in account or the last admin.
- Changed local media storage to save portable `/uploads/...` paths instead of hardcoded localhost URLs.
- Added API response media URL normalization so readers can view uploaded images, videos, and audio from the correct backend origin.
- Configured Helmet cross-origin resource policy so media can load when frontend and backend use different origins.
- Added blog edit media controls for previewing, replacing and removing existing featured images, gallery images, videos and audio.
- Added media cleanup when files are removed, replaced or when a blog is deleted.

## First Admin Setup

Create the first admin explicitly:

```bash
npm run create-admin -- --name="Your Name" --email="you@example.com" --password="use-a-strong-password"
```

Then seed starter categories/demo content:

```bash
npm run seed
```

After logging in, use `Admin > Users` to create additional admins or authors.

## Local Run

```bash
npm install
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API health: `http://localhost:5000/api/health`

## Media Behavior

For local testing, files are saved in `server/uploads` and served by Express at `/uploads`.

For production, set Cloudinary credentials in `server/.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SERVER_PUBLIC_URL=https://your-backend-url.com
```

Cloudinary uploads use secure Cloudinary URLs. Local uploads use `/uploads/...` in MongoDB and are expanded to the backend origin when the API returns blogs.

During blog edit, existing media is shown in the form. Admins can remove gallery items one by one, remove single media fields, or replace featured image, video and audio by choosing a new file.

## Production Hosting Next Steps

1. Create a MongoDB Atlas database.
2. Create a Cloudinary account for production media.
3. Deploy the Express backend to Render, Railway or Firebase Functions.
4. Set backend env vars: `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `SERVER_PUBLIC_URL` and Cloudinary credentials.
5. Create the first production admin with `npm run create-admin`.
6. Set frontend `VITE_API_URL` to the deployed backend `/api` URL.
7. Build and deploy the React frontend to Firebase Hosting.

## Verification

Latest checks passed:

```bash
npm run build
node --check server/src/controllers/authController.js
node --check server/src/controllers/blogController.js
node --check server/src/routes/authRoutes.js
node --check server/src/utils/media.js
node --check server/src/createAdmin.js
node --check server/src/server.js
node --check server/src/seed.js
npm audit --omit=dev
```

`npm audit --omit=dev` reported zero vulnerabilities.
