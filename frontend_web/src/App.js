import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Theme constants
const THEME_COLORS = {
  primary: "#1976d2",
  secondary: "#424242",
  accent: "#ffb300",
  background: "#f9f9f9",
  white: "#fff",
  border: "#e0e0e0",
  hover: "#f1f5fb"
};

// Util: generate a simple unique id
function uuidv4() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

// PUBLIC_INTERFACE
/**
 * The main Notes App component. Handles state and UI for notes management.
 *
 * - Sidebar: Shows notes list.
 * - Main area: Note view/edit, action buttons.
 * - App bar: App title and "New note" button.
 * - Responsive: Layout adapts for mobile/desktop.
 * - Theme: Uses specified color palette.
 */
function App() {
  // Notes state, store in localStorage for demo persistence
  const [notes, setNotes] = useState(() =>
    JSON.parse(localStorage.getItem("notes") || "[]")
  );
  const [selectedId, setSelectedId] = useState(
    notes.length > 0 ? notes[0].id : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile

  // For edit form
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const titleInputRef = useRef(null);

  // Effect: Persist notes to localStorage
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Effect: Select first note if none selected
  useEffect(() => {
    if (notes.length && !selectedId) {
      setSelectedId(notes[0].id);
    } else if (!notes.length && selectedId) {
      setSelectedId(null);
    }
  }, [notes, selectedId]);

  // Effect: Focus title input on start editing
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing, selectedId]);

  // Get selected note object
  const selectedNote = notes.find((n) => n.id === selectedId);

  // PUBLIC_INTERFACE
  // Create a new note
  function handleCreate() {
    const newNote = {
      id: uuidv4(),
      title: "Untitled Note",
      body: "",
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setSelectedId(newNote.id);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditBody(newNote.body);
    setSidebarOpen(false);
  }

  // PUBLIC_INTERFACE
  // Enter edit mode for selected note
  function handleEdit() {
    if (!selectedNote) return;
    setIsEditing(true);
    setEditTitle(selectedNote.title);
    setEditBody(selectedNote.body);
  }

  // PUBLIC_INTERFACE
  // Save changes (create or update note)
  function handleSave(e) {
    e.preventDefault();
    if (!editTitle.trim()) {
      alert("Title cannot be empty");
      return;
    }
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === selectedId
          ? {
              ...n,
              title: editTitle,
              body: editBody,
              updated: new Date().toISOString()
            }
          : n
      )
    );
    setIsEditing(false);
  }

  // PUBLIC_INTERFACE
  // Delete selected note
  function handleDelete() {
    if (!selectedNote) return;
    const filtered = notes.filter((n) => n.id !== selectedNote.id);
    setNotes(filtered);
    setIsEditing(false);
    if (filtered.length) setSelectedId(filtered[0].id);
    else setSelectedId(null);
  }

  // PUBLIC_INTERFACE
  // Select note by ID
  function handleSelect(id) {
    setSelectedId(id);
    setIsEditing(false);
    setSidebarOpen(false);
  }

  // PUBLIC_INTERFACE
  // Cancel editing
  function handleCancelEdit() {
    setIsEditing(false);
  }

  // Keyboard shortcut for new note: Cmd/Ctrl + N
  useEffect(() => {
    const listener = (e) => {
      if (
        ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) &&
        e.key.toLowerCase() === "n"
      ) {
        e.preventDefault();
        handleCreate();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
    // eslint-disable-next-line
  }, []);

  // AppBar component
  function AppBar() {
    return (
      <header className="app-bar" style={{ background: THEME_COLORS.primary }}>
        <button
          className="sidebar-toggle"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <h1 className="app-title" style={{ color: THEME_COLORS.white }}>NoteMaster</h1>
        <button
          className="new-note-btn"
          style={{
            background: THEME_COLORS.accent,
            color: THEME_COLORS.secondary
          }}
          onClick={handleCreate}
        >
          + New Note
        </button>
      </header>
    );
  }

  // Sidebar (Notes List)
  function Sidebar() {
    return (
      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        style={{ background: THEME_COLORS.secondary }}
      >
        <div className="sidebar-header">
          <span className="sidebar-title">Your Notes</span>
        </div>
        <nav className="notes-list">
          {notes.length === 0 && (
            <div className="notes-empty">No notes yet.</div>
          )}
          {notes.map((note) => (
            <button
              key={note.id}
              className={`note-list-item${note.id === selectedId ? " active" : ""}`}
              style={{
                borderColor: note.id === selectedId ? THEME_COLORS.primary : "transparent",
                background:
                  note.id === selectedId ? "#e3f0fc" : "transparent",
                color: note.id === selectedId ? THEME_COLORS.primary : "#fafafa"
              }}
              onClick={() => handleSelect(note.id)}
              title={note.title}
            >
              <div className="list-title">{note.title || <em>(Untitled)</em>}</div>
              <div className="list-date">
                {new Date(note.updated).toLocaleDateString(undefined, {
                  month: "short",
                  day: "2-digit"
                })}
              </div>
            </button>
          ))}
        </nav>
      </aside>
    );
  }

  // Main view area: View or edit content
  function MainArea() {
    if (!selectedNote && !isEditing) {
      return (
        <main className="main-area no-note">
          <p>
            Select a note or <button
              className="inline-btn"
              style={{ color: THEME_COLORS.primary }}
              onClick={handleCreate}
            >create a new note</button>
            .
          </p>
        </main>
      );
    }

    if (isEditing) {
      return (
        <main className="main-area main-edit">
          <form className="edit-form" onSubmit={handleSave}>
            <input
              className="edit-title"
              ref={titleInputRef}
              type="text"
              maxLength={80}
              placeholder="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                borderColor: THEME_COLORS.primary,
                color: THEME_COLORS.primary
              }}
              required
            />
            <textarea
              className="edit-body"
              placeholder="Write your note here..."
              rows={12}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              style={{ borderColor: THEME_COLORS.border }}
            />
            <div className="edit-actions">
              <button
                type="submit"
                className="btn-primary"
                style={{
                  background: THEME_COLORS.primary,
                  color: THEME_COLORS.white
                }}
              >
                Save
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  background: "#f6f6f6",
                  color: THEME_COLORS.secondary,
                  border: `1px solid ${THEME_COLORS.border}`
                }}
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      );
    }

    // Viewing mode
    return (
      <main className="main-area">
        <div className="note-meta">
          <span className="note-date">
            Updated {new Date(selectedNote.updated).toLocaleString()}
          </span>
        </div>
        <div className="note-title">{selectedNote.title}</div>
        <div className="note-body">
          {selectedNote.body ? (
            selectedNote.body.split("\n").map((line, idx) => (
              <div key={idx}>{line}</div>
            ))
          ) : (
            <span className="note-empty">(No content)</span>
          )}
        </div>
        <div className="note-actions">
          <button
            className="btn-edit"
            style={{
              background: THEME_COLORS.primary,
              color: THEME_COLORS.white
            }}
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="btn-delete"
            style={{
              background: THEME_COLORS.accent,
              color: THEME_COLORS.secondary
            }}
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </main>
    );
  }

  // Main layout, grid-based for desktop, stack for mobile
  return (
    <div className="notes-app-root" style={{ background: THEME_COLORS.background }}>
      <AppBar />
      <div className="content-area">
        <Sidebar />
        <MainArea />
      </div>
      {/* Overlay for sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
