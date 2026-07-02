import { useEffect, useState } from "react";
import api from "../services/api";

export default function Videos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    api.get("/blogs?limit=50").then(({ data }) => {
      setVideos(data.items.filter((blog) => blog.video?.url));
    });
  }, []);

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">Videos</p>
        <h1 className="text-4xl font-black">Field Reports</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {videos.map((blog) => (
          <article key={blog._id} className="rounded-md bg-white p-4 shadow-soft">
            <video src={blog.video.url} controls className="aspect-video w-full rounded-md bg-ink" />
            <h2 className="mt-3 font-black">{blog.title}</h2>
          </article>
        ))}
      </div>
      {videos.length === 0 && <p className="rounded-md bg-white p-6 text-ink/60">Videos will appear here after publishing media posts.</p>}
    </section>
  );
}
