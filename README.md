# Environment Warrior CMS

A full-stack MERN CMS for an environmental group. It has public pages for visitors and a protected admin panel for creating, editing, drafting, publishing and deleting rich media blog posts.

## Features

- React public site with home, about, blogs, single blog, gallery, videos and contact pages
- Admin login with JWT
- Blank admin login form with no exposed default credentials
- Multiple admin/author account management from the CMS
- Admin dashboard with blog, draft, like and view analytics
- Blog CRUD with draft/published status
- Edit existing uploaded media, including removing gallery items and replacing featured image, video or audio
- Built-in rich text editor controls
- Category management
- Search, category filtering and pagination
- Image, video and audio uploads
- Local development uploads by default
- Cloudinary-ready uploads when credentials are added
- Portable media URLs so uploaded images render correctly in local and deployed environments

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios
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

4. Create the first admin account explicitly:

```bash
npm run create-admin -- --name="Your Name" --email="you@example.com" --password="use-a-strong-password"
```

5. Seed starter categories and demo content:

```bash
npm run seed
```

6. Run both frontend and backend:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api/health`
- Admin: `http://localhost:5173/admin`

After logging in as an admin, open `Admin > Users` to create more admin or author accounts.

## Cloudinary

For local testing, uploads are saved in `server/uploads` and served from the backend. For hosted production, add these values to `server/.env`:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SERVER_PUBLIC_URL=https://your-backend-url.com
```

When Cloudinary credentials are present, the server uses Cloudinary automatically.

Local uploads are stored in MongoDB as `/uploads/...` paths and expanded to the current API origin when blogs are returned. Cloudinary media keeps its secure Cloudinary URL.

## Firebase Hosting Note

Firebase Hosting can host the React frontend after `npm run build`. The Express API still needs a Node host such as Render, Railway or Firebase Functions. If you want Firebase-only hosting later, move the Express routes into Firebase Functions and set `VITE_API_URL` to the deployed function URL.

## Production Hosting Checklist

1. Create a MongoDB Atlas database and set `MONGO_URI` on the backend host.
2. Create a Cloudinary account and set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.
3. Deploy the Express backend to Render, Railway or Firebase Functions.
4. Set backend environment variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your-atlas-uri
JWT_SECRET=use-a-long-random-secret
CLIENT_URL=https://your-firebase-site.web.app
SERVER_PUBLIC_URL=https://your-backend-url.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

5. Create the first admin on the production backend:

```bash
npm run create-admin -- --name="Your Name" --email="you@example.com" --password="use-a-strong-password"
```

6. Set the frontend production API URL:

```env
VITE_API_URL=https://your-backend-url.com/api
```

7. Build and deploy the frontend to Firebase Hosting:

```bash
npm run build
firebase deploy
```
