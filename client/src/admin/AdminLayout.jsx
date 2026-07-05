import { BarChart3, Folder, LogOut, Newspaper, Mail, PenSquare, User, Users } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Footer from "../components/Footer.jsx";

const links = [
  { label: "Dashboard",    href: "/admin",            icon: BarChart3, role: null,    end: true  },
  { label: "Manage Blogs", href: "/admin/blogs",      icon: Newspaper, role: null,    end: true  },
  { label: "Create Blog",  href: "/admin/blogs/new",  icon: PenSquare, role: null,    end: true  },
  { label: "Categories",   href: "/admin/categories", icon: Folder,    role: null,    end: false },
  { label: "Contacts",     href: "/admin/contacts",   icon: Mail,      role: null,    end: false },
  { label: "Users",        href: "/admin/users",      icon: Users,     role: "admin", end: false },
  { label: "Profile",      href: "/admin/profile",    icon: User,      role: null,    end: false },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-mist flex flex-col">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-ink/10 bg-white p-4 lg:block">
        <Link to="/" className="block font-black text-forest">
          Environment Warrior CMS
        </Link>
        <p className="mt-1 text-sm text-ink/60">{user?.name}</p>
        <nav className="mt-8 grid gap-2">
          {links
            .filter(({ role }) => !role || role === user?.role)
            .map(({ label, href, icon: Icon, end }) => (
              <NavLink
                key={href}
                to={href}
                end={end}
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

      <div className="lg:pl-64 flex flex-col flex-1">

        {/* Mobile Header */}
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
            {links
              .filter(({ role }) => !role || role === user?.role)
              .map(({ label, href, end }) => (
                <NavLink
                  key={href}
                  to={href}
                  end={end} 
                  className={({ isActive }) =>
                    `btn-secondary whitespace-nowrap ${isActive ? "bg-forest text-white" : ""}`
                  }
                >
                  {label}
                </NavLink>
              ))}
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 w-full flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}