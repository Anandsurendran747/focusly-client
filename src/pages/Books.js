import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import './Books.css';
import { createBook, deleteBook, fetchBooks } from '../api';

function StarRating({ rating, onRate, readOnly }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          className={`star ${n <= rating ? 'filled' : ''}`}
          onClick={() => !readOnly && onRate && onRate(n)}
          disabled={readOnly}
          type="button"
        >★</button>
      ))}
    </div>
  );
}

function AddBookModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '', author: '', genre: '', rating: 4,
    dateRead: new Date().toISOString().split('T')[0],
    cover: '📚',
    description: '',
    keyTakeaways: ''
  });

  const COVERS = ['📚', '📖', '📗', '📘', '📙', '📕', '📓', '🔖'];

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;
    onAdd({
      ...form,
      keyTakeaways: form.keyTakeaways.split('\n').map(t => t.trim()).filter(Boolean)
    });
    onClose();
  };

  return (
    <div>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal animate-in">
          <div className="modal-header">
            <h2>Add Book</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Cover Icon</label>
              <div className="cover-picker">
                {COVERS.map(c => (
                  <button type="button" key={c}
                    className={`cover-btn ${form.cover === c ? 'active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, cover: c }))}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Book Title *</label>
                <input name="title" placeholder="The Great Gatsby" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Author *</label>
                <input name="author" placeholder="F. Scott Fitzgerald" value={form.author} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Genre</label>
                <input name="genre" placeholder="Fiction, Non-fiction..." value={form.genre} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Date Read</label>
                <input type="date" name="dateRead" value={form.dateRead} onChange={handleChange} />
              </div>
            </div>

            <div className="form-field">
              <label>Your Rating</label>
              <StarRating rating={form.rating} onRate={(r) => setForm(prev => ({ ...prev, rating: r }))} />
            </div>

            <div className="form-field">
              <label>Description / Review</label>
              <textarea name="description" placeholder="Write your thoughts about this book..." value={form.description} onChange={handleChange} rows={4} />
            </div>

            <div className="form-field">
              <label>Key Takeaways (one per line)</label>
              <textarea name="keyTakeaways" placeholder="What did you learn?&#10;One takeaway per line..." value={form.keyTakeaways} onChange={handleChange} rows={4} />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary">Add Book</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function BookDetail({ book, onClose, onDelete, onUpdate }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal book-detail animate-in">
        <div className="book-detail-header">
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="book-detail-hero">
          <div className="book-cover-large">{book.cover}</div>
          <div className="book-detail-info">
            <span className="book-genre-badge">{book.genre || 'Book'}</span>
            <h2 className="book-detail-title">{book.title}</h2>
            <p className="book-detail-author">by {book.author}</p>
            <StarRating rating={book.rating} readOnly />
            <p className="book-detail-date">Read on {book.dateRead}</p>
          </div>
        </div>

        {book.description && (
          <div className="book-section">
            <h3>Review</h3>
            <p>{book.description}</p>
          </div>
        )}

        {book.keyTakeaways?.length > 0 && (
          <div className="book-section">
            <h3>Key Takeaways</h3>
            <ul className="takeaways-list">
              {book.keyTakeaways.map((t, i) => (
                <li key={i}><span className="takeaway-num">{i + 1}</span>{t}</li>
              ))}
            </ul>
          </div>
        )}
        

        <div className="book-detail-footer">
          <button className="btn-danger" onClick={() => { onDelete(book._id); onClose(); }}>Delete Book</button>
        </div>

      </div>
    </div>
  );
}

export default function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    console.log("Loading books...");
    const loadBooks = async () => {
      try {
        const data = await fetchBooks();
        setBooks(data);
      } catch (error) {
        console.error("Error loading books:", error);
        alert('Failed to load books. Please try again later.');
      }
    };
    loadBooks();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = books.filter(b =>
    !search ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const avgRating = books.length ? (books.reduce((a, b) => a + b.rating, 0) / books.length).toFixed(1) : '—';

  const addBook = async (bookData) => {
    const newBook = await createBook(bookData);
    setBooks(prev => [newBook, ...prev]);
    alert('Book added successfully!');
    setShowModal(false);
  };

  const deleteMyBook = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this book?');
    if (!confirmed) return;
    const deletedBook = await deleteBook(id);
    setBooks(prev => prev.filter(b => b._id !== id));
    alert('Book deleted successfully!');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Books Read
          </h1>
          <p className="page-subtitle">
            Track your reading journey
          </p>
        </div>
      </div>
      <div className="books-page">
        <div className="books-header">
          <div className="todos-stats">
            <div className="stat-pill">
              <span className="stat-num">{books.length}</span>
              <span className="stat-label">Books</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num" style={{ color: '#f7e16a' }}>{avgRating}</span>
              <span className="stat-label">Avg Rating</span>
            </div>
          </div>
          <button className="fab" onClick={() => setShowModal(true)}>
            <span>+</span> Add Book
          </button>
        </div>

        <div className="todos-search">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Search books or authors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="books-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📚</span>
              <p>{books.length === 0 ? 'No books logged yet. Add your first read!' : 'No books match your search.'}</p>
              {books.length === 0 && <button className="btn-primary" onClick={() => setShowModal(true)}>Add First Book</button>}
            </div>
          ) : (
            filtered.map(book => (
              <div key={book._id} className="book-card" onClick={() => setSelected(book)}>
                <div className="book-card-cover">{book.cover}</div>
                <div className="book-card-content">
                  <div>
                    {book.genre && <span className="book-genre-badge">{book.genre}</span>}
                    <h3 className="book-card-title">{book.title}</h3>
                    <p className="book-card-author">by {book.author}</p>
                  </div>
                  <div className="book-card-footer">
                    <StarRating rating={book.rating} readOnly />
                    <span className="book-card-date">{book.dateRead}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && <AddBookModal onClose={() => setShowModal(false)} onAdd={(bookData) => addBook(bookData)} />}
        {selected && <BookDetail book={selected} onClose={() => setSelected(null)} onDelete={(id) => deleteMyBook(id)} onUpdate={(updatedBook) => {
          setBooks(prev => prev.map(b => b._id === updatedBook._id ? updatedBook : b));
          setSelected(null);
        }} />}
      </div>
    </div>
  );
}
