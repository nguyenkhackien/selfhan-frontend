import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { ArrowRight, NotebookPen, Plus, Search, Send } from "lucide-react";
import type {
  LearningHubPageProps,
  Note,
  NoteCategory,
} from "../../types/learning";

const categories: Array<"All" | NoteCategory> = [
  "All",
  "Vocabulary",
  "Writing",
  "Grammar",
];

export function NotesPage({ hub }: LearningHubPageProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [filter, setFilter] = useState<"All" | NoteCategory>("All");
  const [query, setQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const visibleNotes = hub.state.notes.filter((note) => {
    const matchesCategory = filter === "All" || note.category === filter;
    const matchesQuery =
      normalizedQuery === "" ||
      [note.title, note.content, note.category].some((value) =>
        value.toLocaleLowerCase("vi").includes(normalizedQuery),
      );

    return matchesCategory && matchesQuery;
  });

  useEffect(() => {
    if (selectedNote === null || dialogRef.current === null) return;

    const dialog = dialogRef.current;
    const getFocusableElements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    const focusableElements = getFocusableElements();
    (focusableElements[0] ?? dialog).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedNote(null);
        return;
      }

      if (event.key !== "Tab") return;

      const elements = getFocusableElements();
      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement;
      const shouldWrapBackward =
        event.shiftKey &&
        (activeElement === firstElement || activeElement === dialog);
      const shouldWrapForward =
        !event.shiftKey &&
        (activeElement === lastElement || !dialog.contains(activeElement));

      if (shouldWrapBackward) {
        event.preventDefault();
        lastElement.focus();
      } else if (shouldWrapForward) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);

    return () => {
      dialog.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [selectedNote]);

  const openNote = (note: Note, event: MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = event.currentTarget;
    setSelectedNote(note);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    hub.actions.addNote({ title, content, category: "Vocabulary" });
    setTitle("");
    setContent("");
    setShowComposer(false);
  };

  return (
    <div className="notes-layout">
      <section className="notes-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm trong ghi chú"
            aria-label="Tìm trong ghi chú"
          />
        </div>
        <button
          className="button button--primary"
          onClick={() => setShowComposer(!showComposer)}
        >
          <Plus size={17} /> Ghi chú mới
        </button>
      </section>
      {showComposer && (
        <form className="note-composer card" onSubmit={submit}>
          <div>
            <span className="soft-badge">
              <NotebookPen size={15} /> Ý tưởng mới
            </span>
            <h2>Ghi lại trước khi nó trôi qua</h2>
          </div>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tiêu đề ngắn gọn"
            aria-label="Tiêu đề ghi chú"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Viết một ý bạn muốn nhớ…"
            aria-label="Nội dung ghi chú"
          />
          <div>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setShowComposer(false)}
            >
              Huỷ
            </button>
            <button type="submit" className="button button--primary">
              <Send size={16} /> Lưu ghi chú
            </button>
          </div>
        </form>
      )}
      <div className="notes-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={
              filter === category ? "notes-tab notes-tab--active" : "notes-tab"
            }
            onClick={() => setFilter(category)}
            aria-pressed={filter === category}
          >
            {category === "All" ? "Tất cả" : category}
          </button>
        ))}
      </div>
      {visibleNotes.length > 0 ? (
        <section className="note-grid">
          {visibleNotes.map((note) => (
            <article className="note-card card" key={note.id}>
              <div className="note-card__top">
                <span
                  className={`note-category note-category--${note.category.toLowerCase()}`}
                >
                  {note.category}
                </span>
                <span>{note.date}</span>
              </div>
              <h2>{note.title}</h2>
              <p>{note.content}</p>
              <button
                className="note-link"
                onClick={(event) => openNote(note, event)}
              >
                Mở ghi chú <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </section>
      ) : (
        <section className="notes-empty-state card" aria-live="polite">
          <h2>Không tìm thấy ghi chú phù hợp.</h2>
          <p>Thử đổi từ khoá hoặc chọn một danh mục khác.</p>
        </section>
      )}
      {selectedNote && (
        <div className="note-dialog-backdrop">
          <section
            aria-labelledby={`note-dialog-title-${selectedNote.id}`}
            aria-modal="true"
            className="note-dialog card"
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="note-dialog__header">
              <div className="note-card__top">
                <span
                  className={`note-category note-category--${selectedNote.category.toLowerCase()}`}
                >
                  {selectedNote.category}
                </span>
                <span>{selectedNote.date}</span>
              </div>
              <button
                aria-label="Đóng ghi chú"
                className="note-dialog__close"
                onClick={() => setSelectedNote(null)}
                type="button"
              >
                Đóng
              </button>
            </div>
            <h2 id={`note-dialog-title-${selectedNote.id}`}>
              {selectedNote.title}
            </h2>
            <p>{selectedNote.content}</p>
          </section>
        </div>
      )}
    </div>
  );
}
