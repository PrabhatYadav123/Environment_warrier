import { Send, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import api from "../services/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true)
    setStatus("")
    try {
      await api.post("/contact", form);
      setForm({ name: "", email: "", subject: "", message: "" });
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Contact Us | Environment Warrior Group</title>
        <meta name="description" content="Get in touch with Environment Warrior Group. Send event ideas, volunteer notes, partnership requests or local environmental concerns." />
        <meta name="keywords" content="contact environment warrior, volunteer, partnership, environmental concerns India" />
        <meta property="og:title" content="Contact Us | Environment Warrior Group" />
        <meta property="og:description" content="Get in touch with Environment Warrior Group for volunteering, partnerships and environmental concerns." />
        <meta property="og:url" content="https://environment-warrior.vercel.app/contact" />
        <link rel="canonical" href="https://environment-warrior.vercel.app/contact" />
      </Helmet>

      {/* Hero */}
      <section className="bg-white border-b border-ink/10">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-forest">Contact</p>
          <h1 className="mt-2 text-4xl font-black leading-tight md:text-5xl">
            Work With <span className="text-forest">The Group 🌿</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-ink/70">
            Have an event idea, volunteer note, partnership request or a local environmental concern? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[0.9fr_1.1fr]">

        {/* Left — Info */}
        <div className="grid gap-6 content-start">

          {/* Contact Info Cards */}
          {[
            {
              icon: Mail,
              title: "Email Us",
              text: "prabhatkumar@gmail.com",
              sub: "We reply within 24 hours"
            },
            {
              icon: Phone,
              title: "Call Us",
              text: "+91 9708581410",
              sub: "Mon–Sat, 10am – 6pm IST"
            },
            {
              icon: MapPin,
              title: "Location",
              text: "Bengaluru, Karnataka",
              sub: "India 🇮🇳"
            },
            {
              icon: MessageCircle,
              title: "What to Write About?",
              text: null,
              list: [
                "🌱 Volunteer for campaigns",
                "🤝 Partnership proposals",
                "📸 Submit field stories",
                "⚠️ Report environmental issues",
              ]
            }
          ].map(({ icon: Icon, title, text, sub, list }) => (
            <div key={title} className="flex gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-soft">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-forest/10 text-forest">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="font-black">{title}</h3>
                {text && <p className="mt-1 text-sm font-semibold text-ink">{text}</p>}
                {sub && <p className="text-xs text-ink/50 mt-0.5">{sub}</p>}
                {list && (
                  <ul className="mt-2 grid gap-1">
                    {list.map((item) => (
                      <li key={item} className="text-sm text-ink/65">{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right — Form */}
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-md border border-ink/10 bg-white p-6 shadow-soft content-start"
        >
          <h2 className="text-xl font-black">Send a Message</h2>

          {/* Name + Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="label">Your Name *</span>
              <input
                className="field"
                placeholder="Prabhat Kumar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Email Address *</span>
              <input
                className="field"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
          </div>

          {/* Subject */}
          <label className="grid gap-2">
            <span className="label">Subject *</span>
            <input
              className="field"
              placeholder="e.g. Volunteering for beach cleanup"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
          </label>

          {/* Message */}
          <label className="grid gap-2">
            <span className="label">Message *</span>
            <textarea
              className="field min-h-36 resize-none"
              placeholder="Tell us about your idea, concern or request..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </label>

          {/* Submit Button */}
          <button
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Send size={18} />
            {loading ? "Sending..." : "Send Message"}
          </button>

          {/* Status Messages */}
          {status === "success" && (
            <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700 font-semibold">
              ✅ Message sent successfully! We'll get back to you within 24 hours.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-semibold">
              ❌ Something went wrong. Please try again or email us directly.
            </div>
          )}
        </form>

      </section>
    </>
  );
}