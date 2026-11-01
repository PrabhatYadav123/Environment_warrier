import { Outlet } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import RagChat from "./components/RagChat.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-mist">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <RagChat />
    </div>
  );
}
