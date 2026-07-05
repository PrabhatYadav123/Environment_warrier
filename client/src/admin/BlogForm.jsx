import { Image as ImageIcon, Music, Save, Trash2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor.jsx";
import api from "../services/api";
import { Loader2 } from "lucide-react";

const emptyForm = {
  title: "",
  subtitle: "",
  excerpt: "",
  category: "",
  tags: "",
  status: "draft",
  content: "",
};

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState({});
  const [media, setMedia] = useState({
    featuredImage: null,
    galleryImages: [],
    video: null,
    audio: null,
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
          content: data.content || "",
        });
        setMedia({
          featuredImage: data.featuredImage || null,
          galleryImages: data.galleryImages || [],
          video: data.video || null,
          audio: data.audio || null,
        });
      });
    }
  }, [id]);

  function setValue(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => data.append(key, value));

      if (files.featuredImage)
        data.append("featuredImage", files.featuredImage);

      if (files.video) data.append("video", files.video);

      if (files.audio) data.append("audio", files.audio);

      Array.from(files.galleryImages || []).forEach((file) =>
        data.append("galleryImages", file),
      );

      if (id) {
        data.append("keepGalleryImages", JSON.stringify(media.galleryImages));

        if (!media.featuredImage && !files.featuredImage)
          data.append("removeFeaturedImage", "true");

        if (!media.video && !files.video) data.append("removeVideo", "true");

        if (!media.audio && !files.audio) data.append("removeAudio", "true");
      }

      if (id) {
        await api.put(`/blogs/${id}`, data);
      } else {
        await api.post("/blogs", data);
      }

      navigate("/admin/blogs");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save blog");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">
          {id ? "Edit" : "Create"}
        </p>
        <h1 className="text-3xl font-black">
          {id ? "Edit Blog" : "Create Blog"}
        </h1>
      </div>
      <form
        onSubmit={submit}
        className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-soft"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="label">Title</span>
            <input
              className="field"
              value={form.title}
              onChange={(event) => setValue("title", event.target.value)}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="label">Subtitle</span>
            <input
              className="field"
              value={form.subtitle}
              onChange={(event) => setValue("subtitle", event.target.value)}
            />
          </label>
        </div>
        <label className="grid gap-2">
          <span className="label">Excerpt</span>
          <textarea
            className="field min-h-24"
            value={form.excerpt}
            onChange={(event) => setValue("excerpt", event.target.value)}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="label">Category</span>
            <select
              className="field"
              value={form.category}
              onChange={(event) => setValue("category", event.target.value)}
            >
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
            <input
              className="field"
              value={form.tags}
              onChange={(event) => setValue("tags", event.target.value)}
              placeholder="water, climate"
            />
          </label>
          <label className="grid gap-2">
            <span className="label">Status</span>
            <select
              className="field"
              value={form.status}
              onChange={(event) => setValue("status", event.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FileField
            label="Featured Image"
            accept="image/*"
            selected={files.featuredImage?.name}
            onChange={(file) =>
              setFiles((current) => ({ ...current, featuredImage: file }))
            }
          >
            {media.featuredImage && (
              <MediaPreview
                media={media.featuredImage}
                type="image"
                onRemove={() =>
                  setMedia((current) => ({ ...current, featuredImage: null }))
                }
              />
            )}
          </FileField>
          <FileField
            label="Gallery Images"
            accept="image/*"
            multiple
            selected={
              files.galleryImages?.length
                ? `${files.galleryImages.length} new file(s)`
                : ""
            }
            onChange={(fileList) =>
              setFiles((current) => ({ ...current, galleryImages: fileList }))
            }
          >
            {media.galleryImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {media.galleryImages.map((image) => (
                  <MediaPreview
                    key={image.publicId || image.url}
                    media={image}
                    type="image"
                    compact
                    onRemove={() =>
                      setMedia((current) => ({
                        ...current,
                        galleryImages: current.galleryImages.filter(
                          (item) =>
                            (item.publicId || item.url) !==
                            (image.publicId || image.url),
                        ),
                      }))
                    }
                  />
                ))}
              </div>
            )}
          </FileField>
          <FileField
            label="Video"
            accept="video/*"
            selected={files.video?.name}
            onChange={(file) =>
              setFiles((current) => ({ ...current, video: file }))
            }
          >
            {media.video && (
              <MediaPreview
                media={media.video}
                type="video"
                onRemove={() =>
                  setMedia((current) => ({ ...current, video: null }))
                }
              />
            )}
          </FileField>
          <FileField
            label="Audio"
            accept="audio/*"
            selected={files.audio?.name}
            onChange={(file) =>
              setFiles((current) => ({ ...current, audio: file }))
            }
          >
            {media.audio && (
              <MediaPreview
                media={media.audio}
                type="audio"
                onRemove={() =>
                  setMedia((current) => ({ ...current, audio: null }))
                }
              />
            )}
          </FileField>
        </div>
        <label className="grid gap-2">
          <span className="label">Content</span>
          <RichTextEditor
            value={form.content}
            onChange={(value) => setValue("content", value)}
          />
        </label>
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className={`btn-primary w-fit ${
            saving ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Blog
            </>
          )}
        </button>
      </form>
    </section>
  );
}

function FileField({ label, accept, multiple, selected, onChange, children }) {
  return (
    <div className="grid gap-2">
      <span className="label">{label}</span>
      {children}
      <input
        className="field"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) =>
          onChange(multiple ? event.target.files : event.target.files?.[0])
        }
      />
      {selected && (
        <p className="text-xs font-semibold text-forest">
          Selected: {selected}
        </p>
      )}
    </div>
  );
}

function MediaPreview({ media, type, compact = false, onRemove }) {
  const Icon = type === "video" ? Video : type === "audio" ? Music : ImageIcon;
  const name = media.originalName || media.publicId || "Uploaded media";

  return (
    <div className="overflow-hidden rounded-md border border-ink/10 bg-mist">
      {type === "image" && media.url ? (
        <img
          src={media.url}
          alt={name}
          className={`${compact ? "h-28" : "h-44"} w-full object-cover`}
        />
      ) : type === "video" && media.url ? (
        <video
          src={media.url}
          controls
          className="h-44 w-full bg-black object-contain"
        />
      ) : type === "audio" && media.url ? (
        <div className="grid gap-3 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink/70">
            <Music size={16} /> {name}
          </div>
          <audio src={media.url} controls className="w-full" />
        </div>
      ) : (
        <div className="grid h-28 place-items-center text-ink/50">
          <Icon size={24} />
        </div>
      )}
      <div className="flex items-center justify-between gap-3 p-2">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-ink/70">
          <Icon size={14} className="shrink-0" />
          <span className="truncate">{name}</span>
        </div>
        <button
          type="button"
          className="btn-secondary px-2 py-1 text-red-700"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
