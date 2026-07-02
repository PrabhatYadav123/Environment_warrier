export default function About() {
  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-wide text-forest">About</p>
      <h1 className="text-4xl font-black">Environment Warrior Group</h1>
      <p className="text-lg leading-8 text-ink/70">
        This platform helps the group publish field stories, educational resources, event reports and multimedia updates without needing HTML knowledge.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {["Awareness", "Action", "Accountability"].map((item) => (
          <div key={item} className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
            <h2 className="font-black">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">Share work clearly and keep the community involved.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
