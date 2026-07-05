import { Mail, Trash2, Eye, EyeOff, User, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";
import { formatDate } from "../utils/format";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/contact")
      .then(({ data }) => setContacts(data))
      .finally(() => setLoading(false))
  }, [])

  async function handleRead(id) {
    await api.put(`/contact/${id}/read`)
    setContacts(prev =>
      prev.map(c => c._id === id ? { ...c, isRead: true } : c)
    )
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this message?")) return
    await api.delete(`/contact/${id}`)
    setContacts(prev => prev.filter(c => c._id !== id))
    if (selected?._id === id) setSelected(null)
  }

  const unread = contacts.filter(c => !c.isRead).length

  if (loading) return (
    <div className="grid gap-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="h-20 rounded-md bg-white animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="grid gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Contact Messages</h1>
          <p className="text-sm text-ink/60 mt-1">
            {contacts.length} total —
            <span className="text-forest font-semibold"> {unread} unread</span>
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-forest/10 text-forest">
          <Mail size={20} />
        </span>
      </div>

      {contacts.length === 0 && (
        <div className="rounded-md bg-white border border-ink/10 p-10 text-center text-ink/50">
          📭 No messages yet
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_1.5fr]">

        {/* Left — Message List */}
        <div className="grid gap-2 content-start">
          {contacts.map(contact => (
            <div
              key={contact._id}
              onClick={() => {
                setSelected(contact)
                if (!contact.isRead) handleRead(contact._id)
              }}
              className={`cursor-pointer rounded-md border p-4 transition-all ${
                selected?._id === contact._id
                  ? "border-forest bg-forest/5"
                  : "border-ink/10 bg-white hover:border-forest/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!contact.isRead && (
                    <span className="h-2 w-2 rounded-full bg-forest shrink-0 mt-1" />
                  )}
                  <div>
                    <p className="font-bold text-sm">{contact.name}</p>
                    <p className="text-xs text-ink/50">{contact.email}</p>
                  </div>
                </div>
                <span className="text-xs text-ink/40 shrink-0">
                  {formatDate(contact.createdAt)}
                </span>
              </div>
              {contact.subject && (
                <p className="mt-2 text-sm font-semibold text-ink/70 truncate">
                  {contact.subject}
                </p>
              )}
              <p className="mt-1 text-xs text-ink/50 line-clamp-1">
                {contact.message}
              </p>
            </div>
          ))}
        </div>

        {/* Right — Message Detail */}
        {selected ? (
          <div className="rounded-md border border-ink/10 bg-white p-6 content-start grid gap-4 h-fit sticky top-24">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-forest/10 text-forest">
                  <User size={20} />
                </span>
                <div>
                  <p className="font-black">{selected.name}</p>
                  <p className="text-sm text-ink/60">{selected.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRead(selected._id)}
                  className="btn-secondary px-2 py-1 text-xs"
                  title="Mark as read"
                >
                  {selected.isRead ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(selected._id)}
                  className="btn-secondary px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Subject */}
            {selected.subject && (
              <div className="rounded-md bg-mist px-4 py-2">
                <p className="text-xs text-ink/50 uppercase tracking-wide font-bold">Subject</p>
                <p className="font-semibold mt-0.5">{selected.subject}</p>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-ink/40">
              <Clock size={12} />
              {formatDate(selected.createdAt)}
              {selected.isRead
                ? <span className="text-green-500 font-semibold">✓ Read</span>
                : <span className="text-forest font-semibold">● Unread</span>
              }
            </div>

            {/* Message */}
            <div>
              <p className="text-xs text-ink/50 uppercase tracking-wide font-bold mb-2">Message</p>
              <p className="text-sm leading-7 text-ink/80 whitespace-pre-wrap">
                {selected.message}
              </p>
            </div>

            {/* Reply Button */}
            
             <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your message"}`}
              className="btn-primary w-full text-center" >
              <Mail size={16} /> Reply via Email
            </a>

          </div>
        ) : (
          <div className="rounded-md border border-ink/10 bg-white p-10 text-center text-ink/40 h-fit">
            👆 Select a message to read
          </div>
        )}

      </div>
    </div>
  )
}