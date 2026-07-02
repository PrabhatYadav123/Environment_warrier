import { useEffect, useState } from "react";
import api from "../services/api";

export default function Gallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    api.get("/blogs?limit=50").then(({ data }) => {
      setImages(
        data.items.flatMap((blog) => [
          ...(blog.featuredImage?.url ? [{ ...blog.featuredImage, title: blog.title }] : []),
          ...(blog.galleryImages || []).map((image) => ({ ...image, title: blog.title }))
        ])
      );
    });
  }, []);

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">Gallery</p>
        <h1 className="text-4xl font-black">Campaign Photos</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <figure key={image.url} className="overflow-hidden rounded-md bg-white shadow-soft">
            <img src={image.url} alt={image.originalName || image.title} className="h-72 w-full object-cover" />
            <figcaption className="p-3 text-sm font-semibold">{image.title}</figcaption>
          </figure>
        ))}
      </div>
      {images.length === 0 && <p className="rounded-md bg-white p-6 text-ink/60">Images will appear here after publishing media posts.</p>}
    </section>
  );
}
