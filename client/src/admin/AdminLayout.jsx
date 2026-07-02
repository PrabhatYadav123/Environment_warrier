import { BarChart3, Folder, LogOut, Newspaper, PenSquare, User, Users } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  ["Dashboard", "/admin", BarChart3],
  ["Manage Blogs", "/admin/blogs", Newspaper],
  ["Create Blog", "/admin/blogs/new", PenSquare],
  ["Categories", "/admin/categories", Folder],
  ["Users", "/admin/users", Users, "admin"],
  ["Profile", "/admin/profile", User]
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-ink/10 bg-white p-4 lg:block">
        <Link to="/" className="block font-black text-forest">
          Environment Warrior CMS
        </Link>
        <p className="mt-1 text-sm text-ink/60">{user?.name}</p>
        <nav className="mt-8 grid gap-2">
          {links.filter(([, , , role]) => !role || role === user?.role).map(([label, href, Icon]) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ${
                  isActive ? "bg-forest text-white" : "text-ink/70 hover:bg-mist"
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={signOut} className="btn-secondary mt-8 w-full">
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="font-black text-forest">
              CMS
            </Link>
            <button onClick={signOut} className="btn-secondary px-3">
              <LogOut size={18} />
            </button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {links.filter(([, , , role]) => !role || role === user?.role).map(([label, href]) => (
              <NavLink key={href} to={href} end={href === "/admin"} className="btn-secondary whitespace-nowrap">
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
