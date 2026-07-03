import { Leaf, Mail, Facebook, Twitter, Instagram, Youtube, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-green-600 text-white">
              <Leaf size={20} />
            </span>
            <div>
              <p className="text-white font-bold text-lg">Environment Warrior</p>
              <p className="text-xs text-gray-400">Fighting for a cleaner planet</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            A community-driven platform sharing stories, campaigns, and grassroots action for environmental change.
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-4 pt-2">
            <a href="#" className="hover:text-green-400 transition"><Facebook size={18} /></a>
            <a href="#" className="hover:text-green-400 transition"><Twitter size={18} /></a>
            <a href="#" className="hover:text-green-400 transition"><Instagram size={18} /></a>
            <a href="#" className="hover:text-green-400 transition"><Youtube size={18} /></a>
            <a href="mailto:contact@envwarrior.org" className="hover:text-green-400 transition"><Mail size={18} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-green-400 transition">🏠 Home</Link></li>
            <li><Link to="/blogs" className="hover:text-green-400 transition">📝 All Blogs</Link></li>
            <li><Link to="/contact" className="hover:text-green-400 transition">📬 Contact Us</Link></li>
            <li><Link to="/admin" className="hover:text-green-400 transition">🔐 Admin Login</Link></li>
          </ul>
        </div>

        {/* Topics */}
        {/* <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Topics We Cover</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-green-400 transition cursor-pointer">🌱 Climate Change</li>
            <li className="hover:text-green-400 transition cursor-pointer">♻️ Recycling & Waste</li>
            <li className="hover:text-green-400 transition cursor-pointer">🌊 Ocean Conservation</li>
            <li className="hover:text-green-400 transition cursor-pointer">🌳 Reforestation</li>
            <li className="hover:text-green-400 transition cursor-pointer">☀️ Renewable Energy</li>
          </ul>
        </div> */}

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {currentYear} Environment Warrior Group. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-red-400 fill-red-400" /> for the planet 🌍
          </p>
        </div>
      </div>

    </footer>
  );
}