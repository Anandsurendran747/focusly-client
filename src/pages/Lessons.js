import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import './Lessons.css';
import { createLesson, deleteLesson, fetchLessons, updateLesson } from '../api';

const CATEGORIES = ['Life', 'Productivity', 'Health', 'Finance', 'Relationships', 'Career', 'Mindset', 'Tech', 'Other'];
const CATEGORY_COLORS = {
  Life: '#7c6af7', Productivity: '#6af7c4', Health: '#6af7a0',
  Finance: '#f7c94a', Relationships: '#f76ab4', Career: '#6ab4f7',
  Mindset: '#f7916a', Tech: '#9b6af7', Other: '#a0a0b8'
};

const EMOJIS = ['💡', '🔥', '🚀', '🌱', '⚡', '🎯', '🌊', '🧠', '💪', '✨', '🔑', '📌', '🌟', '🎓', '🛠️'];

function AddLessonModal({ lesson, onClose, onAdd, onUpdate }) {
  const [form, setForm] = useState({ title: '', category: 'Life', emoji: '💡', content: '' });

  useEffect(() => {
    if (lesson) {
      setForm({
        title: lesson.title || '',
        category: lesson.category || 'Life',
        emoji: lesson.emoji || '💡',
        content: lesson.content || ''
      });
    } else {
      setForm({ title: '', category: 'Life', emoji: '💡', content: '' });
    }
  }, [lesson]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    if (lesson) {
      onUpdate(lesson._id, form);
    } else {
      onAdd(form);
    }
    onClose();
  };

  return (

    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div className="modal-header">
          <h2>{lesson ? 'Edit Lesson' : 'New Lesson'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Emoji</label>
            <div className="emoji-picker">
              {EMOJIS.map(em => (
                <button type="button" key={em}
                  className={`emoji-btn ${form.emoji === em ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, emoji: em }))}>
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Lesson Title *</label>
            <input name="title" placeholder="What did you learn?" value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Category</label>
            <div className="category-grid">
              {CATEGORIES.map(c => (
                <button type="button" key={c}
                  className={`category-chip ${form.category === c ? 'active' : ''}`}
                  style={{ '--cc': CATEGORY_COLORS[c] }}
                  onClick={() => setForm(prev => ({ ...prev, category: c }))}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Details *</label>
            <textarea name="content" placeholder="Describe what you learned and why it matters..." value={form.content} onChange={handleChange} rows={5} required />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{lesson ? 'Update Lesson' : 'Save Lesson'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LessonCard({ lesson, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const color = CATEGORY_COLORS[lesson.category] || '#a0a0b8';

  return (
    <div className="lesson-card animate-in" style={{ '--lc': color }}>
      <div className="lesson-header" onClick={() => setExpanded(!expanded)}>
        <div className="lesson-emoji">{lesson.emoji}</div>
        <div className="lesson-info">
          <div className="lesson-title-row">
            <h3 className="lesson-title">{lesson.title}</h3>
            <span className="lesson-expand">{expanded ? '▲' : '▼'}</span>
          </div>
          <div className="lesson-meta">
            <span className="lesson-category" style={{ color }}>{lesson.category}</span>
            <span className="lesson-date">{lesson.date}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="lesson-body animate-in">
          <p>{lesson.content}</p>
          <div className="lesson-actions">
            <button className="lesson-edit" onClick={() => onEdit(lesson)}>Edit</button>
            <button className="lesson-delete" onClick={() => onDelete(lesson._id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  useEffect(() => {
    async function getLessons() {
      const data = await fetchLessons();
      setLessons(data);
    }
    getLessons();
  }, []);
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');

  const openNewLessonModal = () => {
    setEditingLesson(null);
    setShowModal(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setShowModal(true);
  };

  const filtered = lessons.filter(l => {
    if (filterCat !== 'All' && l.category !== filterCat) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const usedCategories = ['All', ...new Set(lessons.map(l => l.category))];

  const createMyLesson = async (lessonData) => {
    const newLesson = await createLesson(lessonData);
    setLessons(prev => [newLesson, ...prev]);
  }
  const updateMyLesson = async (id, lessonData) => {
    const updatedLesson = await updateLesson(id, lessonData);
    setLessons(prev => prev.map(l => (l._id === id ? updatedLesson : l)));
  }
  const deleteMyLesson = async (id) => {
    const willDelete = window.confirm("Are you sure you want to delete this lesson?");
    if (!willDelete) return;
    const success = await deleteLesson(id);
    setLessons(prev => prev.filter(l => l._id !== id));
    alert('Lesson deleted successfully!');
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Lessons Learned
          </h1>
          <p className="page-subtitle">
            Capture your insights
          </p>
        </div>
      </div>
      <div className="lessons-page">
        <div className="todos-header">
          <div className="todos-stats">
            <div className="stat-pill">
              <span className="stat-num">{lessons.length}</span>
              <span className="stat-label">Lessons</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num" style={{ color: 'var(--accent2)' }}>
                {new Set(lessons.map(l => l.category)).size}
              </span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
          <button className="fab" onClick={openNewLessonModal}>
            <span>+</span> New Lesson
          </button>
        </div>

        <div className="todos-search">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Search lessons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="todos-filters">
          {usedCategories.map(cat => (
            <button key={cat}
              className={`filter-btn ${filterCat === cat ? 'active' : ''}`}
              onClick={() => setFilterCat(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="lessons-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">💡</span>
              <p>{lessons.length === 0 ? 'No lessons logged yet. Record your first insight!' : 'No lessons match your filters.'}</p>
              {lessons.length === 0 && <button className="btn-primary" onClick={() => setShowModal(true)}>Add Lesson</button>}
            </div>
          ) : (
            filtered.map(lesson => (
              <LessonCard key={lesson._id} lesson={lesson} onDelete={deleteMyLesson} onEdit={handleEditLesson} />
            ))
          )}
        </div>

        {showModal && <AddLessonModal lesson={editingLesson} onClose={() => { setShowModal(false); setEditingLesson(null); }} onAdd={createMyLesson} onUpdate={updateMyLesson} />}
      </div>
    </div>
  );
}
