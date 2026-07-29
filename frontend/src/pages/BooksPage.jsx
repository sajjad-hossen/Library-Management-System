import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, X, BookOpen, Loader2, ImagePlus } from 'lucide-react';
import './BooksPage.css';

const API = 'http://localhost:5044/api/books';
const STATIC = 'http://localhost:5044';

const emptyForm = { title: '', author: '', isbn: '', publisher: '', publicationYear: new Date().getFullYear(), category: '' };

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [addCopyId, setAddCopyId] = useState(null);
  const [error, setError] = useState('');

  // Cover image state
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch books');
      setBooks(await res.json());
    } catch {
      setError('Could not load books. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBooks, 300);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  const openCreate = () => {
    setEditBook(null);
    setForm(emptyForm);
    setCoverFile(null);
    setCoverPreview(null);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (book) => {
    setEditBook(book);
    setForm({ title: book.title, author: book.author, isbn: book.isbn, publisher: book.publisher, publicationYear: book.publicationYear, category: book.category });
    setCoverFile(null);
    setCoverPreview(book.coverImageUrl ? `${STATIC}${book.coverImageUrl}` : null);
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError('');
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title || !form.author || !form.isbn) { setError('Title, Author, and ISBN are required.'); return; }
    setSaving(true);
    try {
      const url = editBook ? `${API}/${editBook.id}` : API;
      const method = editBook ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Save failed');
      const savedBook = await res.json();

      // Upload cover if a file was selected
      if (coverFile) {
        setUploadingCover(true);
        const fd = new FormData();
        fd.append('file', coverFile);
        await fetch(`${API}/${savedBook.id}/cover`, { method: 'POST', body: fd });
        setUploadingCover(false);
      }

      closeModal();
      fetchBooks();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
      setUploadingCover(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBooks(prev => prev.filter(b => b.id !== id));
    } catch {
      setError('Failed to delete book.');
    } finally {
      setDeleteId(null);
    }
  };

  const handleAddCopy = async (id) => {
    setAddCopyId(id);
    try {
      const res = await fetch(`${API}/${id}/copies`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const updatedBook = await res.json();
      setBooks(prev => prev.map(b => b.id === id ? updatedBook : b));
    } catch {
      setError('Failed to add book copy.');
    } finally {
      setAddCopyId(null);
    }
  };

  return (
    <div className="books-page">
      <div className="page-header">
        <div className="page-title">
          <BookOpen size={28} color="var(--primary-color)" />
          <h1>Book Management</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add Book
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} color="var(--text-secondary)" />
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && !modalOpen && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <Loader2 size={32} className="spin" />
          <p>Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} color="var(--text-secondary)" />
          <p>No books found. Add one to get started!</p>
        </div>
      ) : (
        <div className="grid-cards">
          {books.map(book => (
            <div key={book.id} className="book-card glass-panel">
              {/* Cover image */}
              {book.coverImageUrl ? (
                <div className="book-cover">
                  <img src={`${STATIC}${book.coverImageUrl}`} alt={book.title} />
                </div>
              ) : (
                <div className="book-cover book-cover-placeholder">
                  <BookOpen size={36} color="var(--text-secondary)" />
                </div>
              )}
              <div className="book-category">{book.category || 'General'}</div>
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">by {book.author}</p>
              <div className="book-meta">
                <span><strong>ISBN:</strong> {book.isbn}</span>
                <span><strong>Year:</strong> {book.publicationYear}</span>
              </div>
              <div className="book-copies">
                <span className="copies-available">{book.availableCopies ?? 0} available</span>
                <span className="copies-total">/ {book.totalCopies ?? 0} total</span>
                {book.availableCopyIds && book.availableCopyIds.length > 0 && (
                  <div className="copy-ids">IDs: {book.availableCopyIds.join(', ')}</div>
                )}
              </div>
              <div className="book-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAddCopy(book.id)}
                  disabled={addCopyId === book.id}
                >
                  {addCopyId === book.id ? <Loader2 size={15} className="spin" /> : <Plus size={15} />}
                  Add Copy
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(book)}>
                  <Pencil size={15} /> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(book.id)}
                  disabled={deleteId === book.id}
                >
                  {deleteId === book.id ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button className="icon-btn" onClick={closeModal}><X size={20} /></button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Cover upload area */}
            <div
              className="cover-upload-zone"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="cover-preview" />
              ) : (
                <div className="cover-upload-placeholder">
                  <ImagePlus size={32} color="var(--text-secondary)" />
                  <p>Click or drag & drop a cover image</p>
                  <span>JPG, PNG, WEBP up to 10 MB</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverChange}
              />
            </div>

            <div className="form-grid">
              <div className="form-group span-2">
                <label>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Book title" />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Author name" />
              </div>
              <div className="form-group">
                <label>ISBN *</label>
                <input value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} placeholder="978-..." />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input value={form.publisher} onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))} placeholder="Publisher name" />
              </div>
              <div className="form-group">
                <label>Publication Year</label>
                <input type="number" value={form.publicationYear} onChange={e => setForm(f => ({ ...f, publicationYear: +e.target.value }))} />
              </div>
              <div className="form-group span-2">
                <label>Category</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Science, Fiction, History" />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploadingCover}>
                {(saving || uploadingCover) ? <Loader2 size={16} className="spin" /> : null}
                {uploadingCover ? 'Uploading cover...' : saving ? 'Saving...' : editBook ? 'Save Changes' : 'Create Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
