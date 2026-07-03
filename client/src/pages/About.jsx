import { Helmet } from "react-helmet-async";
import { Leaf, Target, Users, Globe, TreePine, Droplets } from "lucide-react";

export default function About() {
  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>About Us | Environment Warrior Group</title>
        <meta name="description" content="Environment Warrior Group is a community-driven platform publishing climate stories, conservation guides and community action updates for a cleaner, greener planet." />
        <meta name="keywords" content="Environment Warrior Group, about us, climate action India, environmental community, conservation group" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Us | Environment Warrior Group" />
        <meta property="og:description" content="A community-driven platform fighting for a cleaner and greener planet through awareness, action and accountability." />
        <meta property="og:url" content="https://environment-warrior.vercel.app/about" />
        <meta property="og:image" content="https://environment-warrior.vercel.app/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Us | Environment Warrior Group" />
        <meta name="twitter:description" content="A community-driven platform fighting for a cleaner and greener planet." />

        {/* Canonical */}
        <link rel="canonical" href="https://environment-warrior.vercel.app/about" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-white border-b border-ink/10">
        <div className="mx-auto max-w-5xl px-4 py-16 grid gap-6">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-forest">About Us</p>
          <h1 className="text-4xl font-black leading-tight text-ink md:text-5xl">
            We Are Environment <br />
            <span className="text-forest">Warriors. 🌍</span>
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-ink/70">
            Environment Warrior Group is a community-driven platform dedicated to publishing field stories, educational resources, event reports and multimedia updates — empowering everyone to fight for a cleaner, greener planet.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mx-auto max-w-5xl px-4 py-12 grid gap-10">

        {/* 3 Pillars */}
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-forest mb-2">Our Pillars</p>
          <h2 className="text-3xl font-black mb-6">What We Stand For</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Leaf,
                title: "Awareness",
                text: "We share stories, data and field updates to educate communities about pressing environmental issues."
              },
              {
                icon: Target,
                title: "Action",
                text: "From cleanup drives to reforestation campaigns — we document and inspire real on-ground action."
              },
              {
                icon: Users,
                title: "Accountability",
                text: "We hold governments, corporations and communities accountable for their environmental impact."
              }
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-forest text-white mb-4">
                  <Icon size={22} />
                </span>
                <h3 className="font-black text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What We Cover */}
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-forest mb-2">Focus Areas</p>
          <h2 className="text-3xl font-black mb-6">Topics We Cover</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Globe, title: "Climate Change", text: "Tracking global warming, carbon emissions and climate policy updates." },
              { icon: TreePine, title: "Reforestation", text: "Stories from tree plantation drives and forest conservation efforts." },
              { icon: Droplets, title: "Water Conservation", text: "River cleanup campaigns, water harvesting and ocean protection." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-soft">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-forest/10 text-forest">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink/65">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-md bg-forest text-white p-8 grid gap-6 md:grid-cols-3 text-center">
          {[
            { number: "500+", label: "Community Members" },
            { number: "100+", label: "Blogs Published" },
            { number: "50+", label: "Campaigns Covered" },
          ].map(({ number, label }) => (
            <div key={label}>
              <p className="text-4xl font-black">{number}</p>
              <p className="text-white/80 mt-1 text-sm">{label}</p>
            </div>
          ))}
        </div>

      </section>
    </>
  );
}