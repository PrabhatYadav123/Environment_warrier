import {
  Leaf,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  Heart,
  MapPin,
  Phone,
  ArrowUp,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111827] text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center">
                <Leaf className="text-white" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Environment Warrior
                </h2>

                <p className="text-xs text-gray-400">
                  Together For A Greener Tomorrow
                </p>
              </div>
            </div>

            <p className="mt-5 leading-7 text-sm text-gray-400">
              Environment Warrior is dedicated to spreading awareness about
              climate change, wildlife conservation, pollution control,
              sustainable living and inspiring people to protect our planet.
            </p>

            <div className="flex gap-4 mt-6">
              <a href="#">
                <Facebook className="hover:text-green-500 duration-300" />
              </a>

              <a href="#">
                <Instagram className="hover:text-green-500 duration-300" />
              </a>

              <a href="#">
                <Youtube className="hover:text-green-500 duration-300" />
              </a>

              <a href="mailto:contact@environmentwarrior.org">
                <Mail className="hover:text-green-500 duration-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">
              Quick Links
            </h3>

            <ul className="space-y-3">

              <li><Link to="/">Home</Link></li>

              <li><Link to="/blogs">Blogs</Link></li>

              <li><Link to="/gallery">Gallery</Link></li>

              <li><Link to="/videos">Videos</Link></li>

              <li><Link to="/contact">Contact</Link></li>

              <li><Link to="/admin">Admin Login</Link></li>

            </ul>
          </div>

          {/* Categories */}
          <div>

            <h3 className="text-white font-semibold text-lg mb-5">
              Categories
            </h3>

            <ul className="space-y-3">

              <li>🌱 Climate Change</li>

              <li>🌳 Tree Plantation</li>

              <li>♻ Recycling</li>

              <li>🐘 Wildlife</li>

              <li>🌊 Water Conservation</li>

              <li>⚡ Renewable Energy</li>

            </ul>

          </div>

          {/* Contact */}
          <div>

            <h3 className="text-white font-semibold text-lg mb-5">
              Contact
            </h3>

            <div className="space-y-4 text-sm">

              <div className="flex gap-3">

                <MapPin size={18} className="text-green-500" />

                <p>Bengaluru, Karnataka, India</p>

              </div>

              <div className="flex gap-3">

                <Mail size={18} className="text-green-500" />

                <p>contact@environmentwarrior.org</p>

              </div>

              <div className="flex gap-3">

                <Phone size={18} className="text-green-500" />

                <p>+91 XXXXX XXXXX</p>

              </div>

            </div>

            {/* Newsletter */}

            <div className="mt-8">

              <h4 className="text-white mb-3">
                Subscribe Newsletter
              </h4>

              <div className="flex">

                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-l-md bg-gray-800 outline-none"
                />

                <button className="bg-green-600 px-5 rounded-r-md hover:bg-green-700">
                  Join
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="border-t border-gray-800">

        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-sm text-gray-400">

            © {year} Environment Warrior Group. All Rights Reserved.

          </p>

          <div className="flex gap-6 text-sm">

            <Link to="/privacy-policy">Privacy Policy</Link>

            <Link to="/terms">Terms</Link>

            <Link to="/cookies">Cookies</Link>

          </div>

          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="flex items-center gap-2 hover:text-green-400"
          >
            <ArrowUp size={16} />
            Back to Top
          </button>

        </div>

      </div>

    </footer>
  );
}