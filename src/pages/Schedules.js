import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import './Schedules.css';
import { createSchedule, deleteSchedule, fetchSchedules, updateSchedule } from '../api';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#6af7c4' },
  { value: 'medium', label: 'Medium', color: '#f7e16a' },
  { value: 'high', label: 'High', color: '#f76a6a' },
];

function MilestoneRow({ milestone, index, onChange, onRemove, canRemove }) {
  return (
    <div className="milestone-row animate-in">
      <div className="milestone-grid">
        <div className="form-field">
          <label>Milestone</label>
          <input
            name="title"
            placeholder="Meet with team"
            value={milestone.title}
            onChange={(e) => onChange(index, 'title', e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>Description</label>
          <input
            name="description"
            placeholder="What needs to happen"
            value={milestone.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
          />
        </div>
      </div>
      <div className="milestone-grid milestone-time-row">
        <div className="form-field">
          <label>From</label>
          <input
            type="time"
            name="timeFrom"
            value={milestone.timeFrom}
            onChange={(e) => onChange(index, 'timeFrom', e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>To</label>
          <input
            type="time"
            name="timeTo"
            value={milestone.timeTo}
            onChange={(e) => onChange(index, 'timeTo', e.target.value)}
            required
          />
        </div>
        <div className="milestone-remove-wrap">
          {canRemove && (
            <button type="button" className="btn-secondary small" onClick={() => onRemove(index)}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduleModal({ initialData, onClose, onSave, title, submitLabel }) {
  const today = new Date().toISOString().split('T')[0];
  const defaultMilestone = { title: '', description: '', timeFrom: '09:00', timeTo: '10:00' };
  const normalizeDateValue = (value) => {
    if (!value) return today;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? today : date.toISOString().split('T')[0];
  };
  const getInitialForm = () => ({
    title: initialData?.title || '',
    priority: initialData?.priority || 'medium',
    fromDate: normalizeDateValue(initialData?.fromDate),
    toDate: normalizeDateValue(initialData?.toDate),
    milestones: initialData?.milestones?.length
      ? initialData.milestones.map((milestone) => ({
          title: milestone.title || '',
          description: milestone.description || '',
          timeFrom: milestone.timeFrom || '09:00',
          timeTo: milestone.timeTo || '10:00',
        }))
      : [defaultMilestone],
  });

  const [form, setForm] = useState(getInitialForm);

  useEffect(() => {
    setForm(getInitialForm());
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMilestoneChange = (index, field, value) => {
    setForm((prev) => {
      const milestones = [...prev.milestones];
      milestones[index] = { ...milestones[index], [field]: value };
      return { ...prev, milestones };
    });
  };

  const addMilestone = () => {
    setForm((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', description: '', timeFrom: '09:00', timeTo: '10:00' }]
    }));
  };

  const removeMilestone = (index) => {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!form.milestones.every(m => m.title.trim() && m.timeFrom && m.timeTo)) return;

    onSave({
      title: form.title.trim(),
      priority: form.priority,
      fromDate: form.fromDate,
      toDate: form.toDate,
      milestones: form.milestones.map((milestone) => ({
        title: milestone.title.trim(),
        description: milestone.description.trim(),
        timeFrom: milestone.timeFrom,
        timeTo: milestone.timeTo,
      })),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in schedule-modal">
        <div className="modal-header">
          <h2>{title || (initialData ? 'Edit Schedule' : 'New Schedule')}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Schedule Title *</label>
            <input
              name="title"
              placeholder="Project kickoff"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Priority</label>
              <div className="priority-selector">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`priority-btn ${form.priority === option.value ? 'active' : ''}`}
                    style={{ '--pc': option.color }}
                    onClick={() => setForm((prev) => ({ ...prev, priority: option.value }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>From</label>
              <input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>To</label>
              <input type="date" name="toDate" value={form.toDate} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-field">
            <div className="section-label-row">
              <label>Milestones</label>
              <button type="button" className="btn-secondary small" onClick={addMilestone}>
                Add milestone
              </button>
            </div>
            {form.milestones.map((milestone, index) => (
              <MilestoneRow
                key={index}
                milestone={milestone}
                index={index}
                onChange={handleMilestoneChange}
                onRemove={removeMilestone}
                canRemove={form.milestones.length > 1}
              />
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{submitLabel || (initialData ? 'Save Changes' : 'Create Schedule')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}




function ScheduleDetail({ schedule, onClose, onDelete, onEdit }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal schedule-detail animate-in">
        <div className="schedule-detail-header">
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="schedule-detail-hero">
          <div className="schedule-detail-info">
            <span className={`priority-pill ${schedule.priority}`}>{schedule.priority}</span>
            <h2 className="schedule-detail-title">{schedule.title}</h2>
            <p className="schedule-detail-date">
              {schedule.fromDate && schedule.toDate ? `${schedule.fromDate} → ${schedule.toDate}` : 'No date range set'}
            </p>
          </div>
        </div>

        <div className="schedule-section">
          <h3>Milestones</h3>
          <div className="milestone-list">
            {schedule.milestones?.map((milestone, index) => (
              <div key={index} className="milestone-card">
                <div className="milestone-card-top">
                  <span className="milestone-time">{milestone.timeFrom} — {milestone.timeTo}</span>
                  <span className="milestone-index">Step {index + 1}</span>
                </div>
                <h4>{milestone.title}</h4>
                {milestone.description && <p>{milestone.description}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="schedule-detail-footer">
          <button className="btn-secondary" onClick={() => onEdit(schedule)}>
            Edit Schedule
          </button>
          <button className="btn-danger" onClick={() => { onDelete(schedule._id); onClose(); }}>
            Delete Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Schedules() {
  const { user } = useApp();
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const data = await fetchSchedules();
        setSchedules(data);
      } catch (error) {
        console.error('Error loading schedules:', error);
        alert('Failed to load schedules. Please try again later.');
      }
    };
    loadSchedules();
  }, []);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      if (!search) return true;
      return schedule.title.toLowerCase().includes(search.toLowerCase());
    });
  }, [schedules, search]);

  const totalMilestones = useMemo(
    () => schedules.reduce((count, schedule) => count + (schedule.milestones?.length || 0), 0),
    [schedules]
  );

  const addSchedule = async (scheduleData) => {
    const newSchedule = await createSchedule(scheduleData);
    setSchedules((prev) => [newSchedule, ...prev]);
    alert('Schedule added successfully!');
    setShowModal(false);
  };

  const [editingSchedule, setEditingSchedule] = useState(null);

  const deleteMySchedule = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this schedule?');
    if (!confirmed) return;
    await deleteSchedule(id);
    setSchedules((prev) => prev.filter((schedule) => schedule._id !== id));
    if (selected?._id === id) {
      setSelected(null);
    }
    alert('Schedule deleted successfully!');
  };

  const openEditModal = (schedule) => {
    setSelected(null);
    setEditingSchedule(schedule);
  };

  const editSchedule = async (id, scheduleData) => {
    const updated = await updateSchedule(id, scheduleData);
    setSchedules((prev) => prev.map((schedule) => (schedule._id === id ? updated : schedule)));
    if (selected?._id === id) {
      setSelected(updated);
    }
    alert('Schedule updated successfully!');
    setEditingSchedule(null);
  };

  


  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-subtitle">
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Plan your day,'}
            {' '}Track milestones and keep priorities aligned.
          </p>
        </div>
      </div>

      <div className="schedule-page">
        <div className="schedule-header">
          <div className="todos-stats">
            <div className="stat-pill">
              <span className="stat-num">{schedules.length}</span>
              <span className="stat-label">Schedules</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num" style={{ color: 'var(--accent2)' }}>{totalMilestones}</span>
              <span className="stat-label">Milestones</span>
            </div>
          </div>
          <button className="fab" onClick={() => setShowModal(true)}>
            <span>+</span> Add Schedule
          </button>
        </div>

        <div className="todos-search">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Search schedules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="schedules-grid">
          {filteredSchedules.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📅</span>
              <p>{schedules.length === 0 ? 'No schedules yet. Add your first plan!' : 'No schedules match your search.'}</p>
              {schedules.length === 0 && (
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                  Add First Schedule
                </button>
              )}
            </div>
          ) : (
            filteredSchedules.map((schedule) => {
              const priority = PRIORITY_OPTIONS.find((option) => option.value === schedule.priority);
              return (
                <div
                  key={schedule._id}
                  className="schedule-card"
                  onClick={() => setSelected(schedule)}
                >
                  <div className="schedule-card-header">
                    <span className={`priority-pill ${schedule.priority}`}>{schedule.priority}</span>
                    <span className="schedule-count">{schedule.milestones?.length || 0} milestones</span>
                  </div>
                  <h3 className="schedule-card-title">{schedule.title}</h3>
                  <p className="schedule-card-date">
                    {schedule.fromDate && schedule.toDate ? `${schedule.fromDate} → ${schedule.toDate}` : 'No dates'}
                  </p>
                  <div className="schedule-card-footer">
                    {priority && <span className="schedule-priority-color" style={{ background: priority.color }} />}
                    <span className="schedule-card-subtitle">{schedule.milestones?.[0]?.title || 'Start with your first milestone'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showModal && <ScheduleModal onClose={() => setShowModal(false)} onSave={addSchedule} title="New Schedule" submitLabel="Create Schedule" />}
        {editingSchedule && (
          <ScheduleModal
            initialData={editingSchedule}
            onClose={() => setEditingSchedule(null)}
            onSave={(scheduleData) => editSchedule(editingSchedule._id, scheduleData)}
            title="Edit Schedule"
            submitLabel="Save Changes"
          />
        )}
        {selected && <ScheduleDetail schedule={selected} onClose={() => setSelected(null)} onDelete={deleteMySchedule} onEdit={openEditModal} />}
      </div>
    </div>
  );
}
