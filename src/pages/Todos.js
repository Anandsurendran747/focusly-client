
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './Todos.css';
import { createTodo, deleteTodo, fetchTodos, toggleTodo } from '../api';
import { useNavigate } from 'react-router-dom';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { low: '#6af7c4', medium: '#f7e16a', high: '#f76a6a' };
const PRIORITY_LABELS = { low: '↓ Low', medium: '→ Med', high: '↑ High' };



const PERIOD_OPTIONS = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Date' },
];

function AddTodoModal({ onClose, onTodoCreated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    periodType: 'day', dueDate: '', startDate: '', endDate: '', tags: ''
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const todo = await createTodo({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      periodType: form.periodType,
      dueDate: form.periodType === 'custom' ? form.dueDate : null,
      startDate: form.periodType !== 'day' && form.periodType !== 'custom' ? form.startDate : null,
      endDate: form.periodType !== 'day' && form.periodType !== 'custom' ? form.endDate : null,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    alert('Task created successfully!');
    if (onTodoCreated) onTodoCreated(todo);
    navigate('/');

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div className="modal-header">
          <h2>New Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Task title *</label>
            <input name="title" placeholder="What needs to be done?" value={form.title} onChange={handleChange} autoFocus required />
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea name="description" placeholder="Add more details..." value={form.description} onChange={handleChange} rows={3} />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Priority</label>
              <div className="priority-selector">
                {PRIORITIES.map(p => (
                  <button type="button" key={p}
                    className={`priority-btn ${form.priority === p ? 'active' : ''}`}
                    style={{ '--pc': PRIORITY_COLORS[p] }}
                    onClick={() => setForm(prev => ({ ...prev, priority: p }))}>
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-field">
            <label>Time Period</label>
            <div className="period-grid">
              {PERIOD_OPTIONS.map(opt => (
                <button type="button" key={opt.value}
                  className={`period-btn ${form.periodType === opt.value ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, periodType: opt.value }))}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {form.periodType === 'custom' && (
            <div className="form-field animate-in">
              <label>Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
            </div>
          )}

          {(form.periodType === 'week' || form.periodType === 'month' || form.periodType === 'quarter' || form.periodType === 'year') && (
            <div className="form-row animate-in">
              <div className="form-field">
                <label>Start Date</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>End Date</label>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="form-field">
            <label>Tags (comma separated)</label>
            <input name="tags" placeholder="work, personal, urgent..." value={form.tags} onChange={handleChange} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TodoCard({ todo, setTodos }) {
  const [expanded, setExpanded] = useState(false);

  const onToggle = async (id) => {
    const updatedTodo = await toggleTodo(id, !todo.completed);
    // Update the todo in the state
    setTodos(prev => prev.map(t => t._id === id ? updatedTodo : t));
  };

  const onDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;
    const deletedTodo = await deleteTodo(id);
    // Remove the todo from the state
    setTodos(prev => prev.filter(t => t._id !== id));
    // delete todo
  };

  const periodLabel = PERIOD_OPTIONS.find(o => o.value === todo.periodType)?.label || 'Today';

  const dateInfo = todo.dueDate
    ? `Due ${todo.dueDate}`
    : (todo.startDate && todo.endDate ? `${todo.startDate} → ${todo.endDate}` : periodLabel);

  return (
    <div className={`todo-card ${todo.completed ? 'completed' : ''}`} style={{ '--pc': PRIORITY_COLORS[todo.priority] }}>
      <div className="todo-main">
        <button className={`todo-check ${todo.completed ? 'checked' : ''}`} onClick={() => onToggle(todo._id)}>
          {todo.completed && <span>✓</span>}
        </button>
        <div className="todo-content" onClick={() => setExpanded(!expanded)}>
          <span className="todo-title">{todo.title}</span>
          <div className="todo-meta">
            <span className="todo-period">{dateInfo}</span>
            <span className="todo-priority-badge" style={{ color: PRIORITY_COLORS[todo.priority] }}>
              {PRIORITY_LABELS[todo.priority]}
            </span>
            {todo.tags?.length > 0 && todo.tags.slice(0, 2).map(tag => (
              <span key={tag} className="todo-tag">#{tag}</span>
            ))}
          </div>
        </div>
        <button className="todo-delete" onClick={() => onDelete(todo._id)}>✕</button>
      </div>

      {expanded && todo.description && (
        <div className="todo-expanded animate-in">
          <p>{todo.description}</p>
          {todo.tags?.length > 2 && (
            <div className="todo-tags-full">
              {todo.tags.map(tag => <span key={tag} className="todo-tag">#{tag}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Todos() {
  const { user } = useApp();
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    console.log("Loading todos...");
    const loadTodos = async () => {
      try {
        const data = await fetchTodos();
        setTodos(data);
      } catch (error) {
        console.error("Error loading todos:", error);
      }
    };
    loadTodos();
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');

  const filtered = useMemo(() => {
    return todos.filter(t => {
      if (filter === 'active' && t.completed) return false;
      if (filter === 'done' && !t.completed) return false;
      if (periodFilter !== 'all' && t.periodType !== periodFilter) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [todos, filter, periodFilter, search]);

  const stats = useMemo(() => ({
    total: todos.length,
    done: todos.filter(t => t.completed).length,
    today: todos.filter(t => t.periodType === 'day').length,
  }), [todos]);

  const addTodo = async () => {
    const todo = await createTodo(form);
    setTodos(prev => [...prev, todo]);
    setShowModal(false);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            My Tasks
          </h1>
          <p className="page-subtitle">
            `Welcome back, ${user.name.split(' ')[0]} 👋`
          </p>
        </div>
      </div>
      <div className="todos-page">
        <div className="todos-header">
          <div className="todos-stats">
            <div className="stat-pill">
              <span className="stat-num">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num" style={{ color: 'var(--accent3)' }}>{stats.done}</span>
              <span className="stat-label">Done</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num" style={{ color: 'var(--accent2)' }}>{stats.today}</span>
              <span className="stat-label">Today</span>
            </div>
          </div>

          <button className="fab" onClick={() => setShowModal(true)}>
            <span>+</span> New Task
          </button>
        </div>

        {stats.total > 0 && (
          <div className="progress-bar-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(stats.done / stats.total) * 100}%` }} />
            </div>
            <span className="progress-label">{Math.round((stats.done / stats.total) * 100)}% complete</span>
          </div>
        )}

        <div className="todos-search">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="todos-filters">
          {['all', 'active', 'done'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <div className="filter-divider" />
          <button className={`filter-btn ${periodFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPeriodFilter('all')}>All periods</button>
          {PERIOD_OPTIONS.slice(0, 3).map(o => (
            <button key={o.value} className={`filter-btn ${periodFilter === o.value ? 'active' : ''}`}
              onClick={() => setPeriodFilter(o.value)}>
              {o.label}
            </button>
          ))}
        </div>

        <div className="todos-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✓</span>
              <p>{search ? 'No tasks match your search.' : todos.length === 0 ? 'No tasks yet. Add your first one!' : 'No tasks in this view.'}</p>
              {!search && todos.length === 0 && (
                <button className="btn-primary" onClick={() => setShowModal(true)}>Create Task</button>
              )}
            </div>
          ) : (
            filtered.map(todo => (
              <TodoCard key={todo._id} todo={todo} setTodos={setTodos} />
            ))
          )}
        </div>

        {showModal && <AddTodoModal onClose={() => setShowModal(false)} onTodoCreated={todo => setTodos(prev => [...prev, todo])} />}
      </div>
    </div>
  );
}
