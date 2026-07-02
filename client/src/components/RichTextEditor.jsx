import { Bold, Heading1, Heading2, Italic, Link, List, ListOrdered, Quote, Redo2, Undo2 } from "lucide-react";
import { useEffect, useRef } from "react";

const tools = [
  ["bold", Bold, "Bold"],
  ["italic", Italic, "Italic"],
  ["formatBlock", Heading1, "Heading 1", "h1"],
  ["formatBlock", Heading2, "Heading 2", "h2"],
  ["insertUnorderedList", List, "Bulleted list"],
  ["insertOrderedList", ListOrdered, "Numbered list"],
  ["formatBlock", Quote, "Quote", "blockquote"],
  ["createLink", Link, "Link"],
  ["undo", Undo2, "Undo"],
  ["redo", Redo2, "Redo"]
];

export default function RichTextEditor({ value, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function run(command, argument) {
    let nextArgument = argument;
    if (command === "createLink") {
      nextArgument = prompt("Paste link URL");
      if (!nextArgument) return;
    }
    document.execCommand(command, false, nextArgument);
    onChange(ref.current.innerHTML);
    ref.current.focus();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-t-md border border-ink/10 bg-mist p-2">
        {tools.map(([command, Icon, label, argument]) => (
          <button
            key={`${command}-${label}`}
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-ink/70 hover:bg-white hover:text-forest"
            title={label}
            onClick={() => run(command, argument)}
          >
            <Icon size={17} />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="editor-surface prose max-w-none"
        contentEditable
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        suppressContentEditableWarning
      />
    </div>
  );
}
