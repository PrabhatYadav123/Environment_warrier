import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor.jsx";
import api from "../services/api";

const emptyForm = {
  title: "",
  subtitle: "",
  excerpt: "",
  category: "",
  tags: "",
  status: "draft",
  content: ""
};

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState({});
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
    if (id) {
      api.get(`/blogs/id/${id}`).then(({ data }) => {
        setForm({
          title: data.title || "",
          subtitle: data.subtitle || "",
          excerpt: data.excerpt || "",
          category: data.category?._id || "",
          tags: data.tags?.join(", ") || "",
          status: data.status || "draft",
          content: data.content || ""
        });
      });
    }
  }, [id]);

  function setValue(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (files.featuredImage) data.append("featuredImage", files.featuredImage);
    if (files.video) data.append("video", files.video);
    if (files.audio) data.append("audio", files.audio);
    Array.from(files.galleryImages || []).forEach((file) => data.append("galleryImages", file));

    try {
      if (id) {
        await api.put(`/blogs/${id}`, data);
      } else {
        await api.post("/blogs", data);
      }
      navigate("/admin/blogs");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save blog");
    }
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">{id ? "Edit" : "Create"}</p>
        <h1 className="text-3xl font-black">{id ? "Edit Blog" : "Create Blog"}</h1>
      </div>
      <form onSubmit={submit} className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="label">Title</span>
            <input className="field" value={form.title} onChange={(event) => setValue("title", event.target.value)} required />
          </label>
          <label className="grid gap-2">
            <span className="label">Subtitle</span>
            <input className="field" value={form.subtitle} onChange={(event) => setValue("subtitle", event.target.value)} />
          </label>
        </div>
        <label className="grid gap-2">
          <span className="label">Excerpt</span>
          <textarea className="field min-h-24" value={form.excerpt} onChange={(event) => setValue("excerpt", event.target.value)} />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="label">Category</span>
            <select className="field" value={form.category} onChange={(event) => setValue("category", event.target.value)}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="label">Tags</span>
            <input className="field" value={form.tags} onChange={(event) => setValue("tags", event.target.value)} placeholder="water, climate" />
          </label>
          <label className="grid gap-2">
            <span className="label">Status</span>
            <select className="field" value={form.status} onChange={(event) => setValue("status", event.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FileField label="Featured Image" accept="image/*" onChange={(file) => setFiles((current) => ({ ...current, featuredImage: file }))} />
          <FileField label="Gallery Images" accept="image/*" multiple onChange={(fileList) => setFiles((current) => ({ ...current, galleryImages: fileList }))} />
          <FileField label="Video" accept="video/*" onChange={(file) => setFiles((current) => ({ ...current, video: file }))} />
          <FileField label="Audio" accept="audio/*" onChange={(file) => setFiles((current) => ({ ...current, audio: file }))} />
        </div>
        <label className="grid gap-2">
          <span className="label">Content</span>
          <RichTextEditor value={form.content} onChange={(value) => setValue("content", value)} />
        </label>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button className="btn-primary w-fit">
          <Save size={18} /> Save Blog
        </button>
      </form>
    </section>
  );
}

function FileField({ label, accept, multiple, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <input
        className="field"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => onChange(multiple ? event.target.files : event.target.files?.[0])}
      />
    </label>
  );
}
