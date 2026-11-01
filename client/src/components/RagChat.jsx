import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function RagChat() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! Ask me about environmental topics covered in our blogs." }
  ]);
  const inputRef = useRef(null);

  async function sendMessage(event) {
    event.preventDefault();
    const prompt = question.trim();
    if (!prompt || busy) return;
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: prompt }]);
    setBusy(true);
    try {
      const { data } = await api.post("/chat", { question: prompt });
      setMessages((current) => [...current, { role: "assistant", text: data.answer, sources: data.sources }]);
    } catch (error) {
      const message = error.response?.data?.message || "Chat is unavailable right now. Please try again.";
      setMessages((current) => [...current, { role: "assistant", text: message, error: true }]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section className="mb-3 flex h-[min(650px,75vh)] w-[min(390px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-2xl" aria-label="Environment Warrior blog assistant">
          <header className="flex items-center justify-between bg-forest px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Bot size={21} /></span>
              <div><h2 className="font-bold">Blog assistant</h2><p className="text-xs text-white/75">Answers from our articles</p></div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close chat"><X size={19} /></button>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto bg-mist/60 p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-forest text-white" : "bg-white text-ink shadow-sm"}`}>
                <p className={message.error ? "text-red-700" : "whitespace-pre-wrap"}>{message.text}</p>
                {!!message.sources?.length && <div className="mt-3 border-t border-ink/10 pt-2">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/55">Related blogs</p>
                  <ul className="space-y-1">
                    {message.sources.map((source) => <li key={source.slug}><Link className="text-sm font-semibold text-forest underline decoration-forest/30 underline-offset-2 hover:decoration-forest" to={`/blog/${source.slug}`} onClick={() => setOpen(false)}>{source.title}</Link></li>)}
                  </ul>
                </div>}
              </div>
            ))}
            {busy && <div className="flex items-center gap-2 text-sm text-ink/60"><LoaderCircle size={16} className="animate-spin" /> Searching the blogs…</div>}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-ink/10 bg-white p-3">
            <input ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} placeholder="Ask about an environment topic…" className="min-w-0 flex-1 rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-forest" aria-label="Your question" />
            <button disabled={!question.trim() || busy} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send question"><Send size={17} /></button>
          </form>
        </section>
      )}
      <button onClick={() => setOpen((value) => !value)} className="ml-auto flex items-center gap-2 rounded-full bg-forest px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-forest/90" aria-expanded={open} aria-label={open ? "Close blog assistant" : "Open blog assistant"}>
        {open ? <X size={19} /> : <MessageCircle size={19} />}<span>{open ? "Close" : "Ask our blogs"}</span>
      </button>
    </div>
  );
}
