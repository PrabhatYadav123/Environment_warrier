import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Blogs", "/blogs"],
  ["Gallery", "/gallery"],
  ["Videos", "/videos"],
  ["Contact", "/contact"]
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? "bg-forest text-white" : "text-ink hover:bg-white"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-mist/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-black text-forest">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-forest text-white">
            <Leaf size={22} />
          </span>
          <span>Environment Warrior</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([label, href]) => (
            <NavLink key={href} to={href} className={linkClass}>
              {label}
            </NavLink>
          ))}
          <Link to="/admin" className="btn-secondary ml-2">
            Admin
          </Link>
        </nav>
        <button className="btn-secondary px-3 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-ink/10 px-4 pb-4 md:hidden">
          <div className="grid gap-1">
            {links.map(([label, href]) => (
              <NavLink key={href} to={href} onClick={() => setOpen(false)} className={linkClass}>
                {label}
              </NavLink>
            ))}
            <Link to="/admin" className="btn-secondary mt-2" onClick={() => setOpen(false)}>
              Admin
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
