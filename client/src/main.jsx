import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; // ← Add
import "./styles.css";
import App from "./App.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

const AdminLayout = lazy(() => import("./admin/AdminLayout.jsx"));
const BlogForm = lazy(() => import("./admin/BlogForm.jsx"));
const Categories = lazy(() => import("./admin/Categories.jsx"));
const Dashboard = lazy(() => import("./admin/Dashboard.jsx"));
const Login = lazy(() => import("./admin/Login.jsx"));
const ManageBlogs = lazy(() => import("./admin/ManageBlogs.jsx"));
const Profile = lazy(() => import("./admin/Profile.jsx"));
const Users = lazy(() => import("./admin/Users.jsx"));
const Contacts = lazy(() => import("./admin/Contacts.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const BlogDetail = lazy(() => import("./pages/BlogDetail.jsx"));
const Blogs = lazy(() => import("./pages/Blogs.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Gallery = lazy(() => import("./pages/Gallery.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Videos = lazy(() => import("./pages/Videos.jsx"));

function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-black">Page not found</h1>
      <p className="mt-3 text-ink/70">The page you requested does not exist.</p>
    </main>
  );
}

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/admin/login" replace />;
}

function Page({ component: Component }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-4xl px-4 py-12">Loading…</main>}>
      <Component />
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider> {/* ← Wrap karo */}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<App />}>
              <Route index element={<Page component={Home} />} />
              <Route path="about" element={<Page component={About} />} />
              <Route path="blogs" element={<Page component={Blogs} />} />
              <Route path="blog/:slug" element={<Page component={BlogDetail} />} />
              <Route path="gallery" element={<Page component={Gallery} />} />
              <Route path="videos" element={<Page component={Videos} />} />
              <Route path="contact" element={<Page component={Contact} />} />
            </Route>
            <Route path="/admin/login" element={<Page component={Login} />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Page component={AdminLayout} />
                </ProtectedRoute>
              }
            >
              <Route index element={<Page component={Dashboard} />} />
              <Route path="blogs" element={<Page component={ManageBlogs} />} />
              <Route path="blogs/new" element={<Page component={BlogForm} />} />
              <Route path="blogs/:id/edit" element={<Page component={BlogForm} />} />
              <Route path="categories" element={<Page component={Categories} />} />
              <Route path="users" element={<Page component={Users} />} />
              <Route path="profile" element={<Page component={Profile} />} />
              <Route path="contacts" element={<Page component={Contacts} />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider> {/* ← Close karo */}
  </React.StrictMode>
);
