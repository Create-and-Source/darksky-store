import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, addTask, updateTask, deleteTask, subscribe } from '../data/store';
import { useToast, useRole } from '../AdminLayout';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const cardStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: C.shadow };
const btnStyle = { fontFamily: FONT, fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.15s' };
const btnPrimary = { ...btnStyle, background: C.gold, color: '#fff' };
const btnGhost = { ...btnStyle, background: 'transparent', border: `1px solid ${C.border}`, color: C.text };
const labelStyle = { fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, margin: 0 };
const inputStyle = { fontFamily: FONT, fontSize: 14, padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, width: '100%', boxSizing: 'border-box', outline: 'none', color: C.text };

const TYPE_COLORS = {
  call: { bg: '#E8F0FE', text: '#1A73E8' },
  email: { bg: '#FEF7E0', text: '#B8860B' },
  meeting: { bg: '#F3E8FF', text: '#7C3AED' },
  follow_up: { bg: '#E6F4EA', text: '#1E8E3E' },
  other: { bg: '#E8E5DF', text: '#5C5870' },
};

const TYPE_LABELS = { call: 'Call', email: 'Email', meeting: 'Meeting', follow_up: 'Follow-up', other: 'Other' };
const PRIORITY_COLORS = { high: C.danger, medium: C.warning, low: C.muted };
const ASSIGNED_OPTIONS = ['Dr. J', 'Maria', 'Jordan', 'Nancy'];

function toDateStr(d) { return d ? new Date(d).toISOString().split('T')[0] : null; }
function today() { return new Date().toISOString().split('T')[0]; }
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function isOverdue(dueDate, status) {
  if (!dueDate || status === 'completed') return false;
  return dueDate < today();
}
function isToday(dueDate) { return dueDate === today(); }
function withinLastWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return d >= weekAgo && d <= now;
}

function dateColor(dueDate, status) {
  if (status === 'completed') return C.muted;
  if (isOverdue(dueDate, status)) return C.danger;
  if (isToday(dueDate)) return C.warning;
  return C.text2;
}

export default function Tasks() {
  const [tick, setTick] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', constituent: '', dueDate: '', priority: 'medium', type: 'follow_up', assignedTo: 'Dr. J' });
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  const tasks = useMemo(() => getTasks() || [], [tick]);

  const todayStr = today();

  const kpis = useMemo(() => {
    const open = tasks.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const dueToday = tasks.filter(t => t.dueDate === todayStr && t.status !== 'completed').length;
    const overdue = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;
    const completedWeek = tasks.filter(t => t.status === 'completed' && withinLastWeek(t.completedAt)).length;
    return { open, dueToday, overdue, completedWeek };
  }, [tasks, todayStr]);

  const filtered = useMemo(() => {
    let list = tasks;
    if (statusFilter === 'open') list = list.filter(t => t.status === 'open' || t.status === 'in_progress');
    else if (statusFilter === 'overdue') list = list.filter(t => isOverdue(t.dueDate, t.status));
    else if (statusFilter === 'completed') list = list.filter(t => t.status === 'completed');
    if (typeFilter !== 'all') list = list.filter(t => t.type === typeFilter);
    if (assignedFilter !== 'all') list = list.filter(t => t.assignedTo === assignedFilter);
    return list;
  }, [tasks, statusFilter, typeFilter, assignedFilter]);

  const activeTasks = useMemo(() => filtered.filter(t => t.status !== 'completed'), [filtered]);
  const completedTasks = useMemo(() => filtered.filter(t => t.status === 'completed'), [filtered]);

  const toggleComplete = useCallback((task) => {
    if (task.status === 'completed') {
      updateTask(task.id, { status: 'open', completedAt: null });
      toast('Task reopened');
    } else {
      updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() });
      toast('Task completed');
    }
  }, [toast]);

  const handleCreate = useCallback(() => {
    if (!form.title.trim()) return;
    addTask({
      title: form.title.trim(),
      description: form.description.trim(),
      constituent: form.constituent.trim(),
      dueDate: form.dueDate || null,
      priority: form.priority,
      type: form.type,
      assignedTo: form.assignedTo,
      status: 'open',
      completedAt: null,
      createdAt: new Date().toISOString(),
    });
    setForm({ title: '', description: '', constituent: '', dueDate: '', priority: 'medium', type: 'follow_up', assignedTo: 'Dr. J' });
    setShowModal(false);
    toast('Task created');
  }, [form, toast]);

  const Pill = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
      ...btnStyle, fontSize: 12, padding: '6px 14px',
      background: active ? C.gold : 'transparent',
      color: active ? '#fff' : C.text2,
      border: active ? 'none' : `1px solid ${C.border}`,
    }}>{label}</button>
  );

  const KpiCard = ({ label, value, color }) => (
    <div style={{ ...cardStyle, flex: 1, padding: '18px 20px' }}>
      <p style={{ ...labelStyle, marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, color: color || C.text, margin: 0 }}>{value}</p>
    </div>
  );

  const TypeBadge = ({ type }) => {
    const tc = TYPE_COLORS[type] || TYPE_COLORS.other;
    return (
      <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: tc.bg, color: tc.text }}>
        {TYPE_LABELS[type] || type}
      </span>
    );
  };

  const PriorityDot = ({ priority }) => (
    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[priority] || C.muted }} />
  );

  const TaskCard = ({ task }) => {
    const done = task.status === 'completed';
    const dc = dateColor(task.dueDate, task.status);
    return (
      <div style={{ ...cardStyle, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: done ? 0.65 : 1 }}>
        {/* Checkbox */}
        <div onClick={() => toggleComplete(task)} style={{
          width: 22, height: 22, borderRadius: '50%', border: done ? 'none' : `2px solid ${C.border}`,
          background: done ? C.success : 'transparent', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
        }}>
          {done && <span style={{ color: '#fff', fontSize: 13, lineHeight: 1 }}>&#10003;</span>}
        </div>

        {/* Middle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 600, color: done ? C.muted : C.text, margin: 0,
            textDecoration: done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{task.title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            {task.constituent && (
              <span onClick={() => navigate('/admin/crm')} style={{
                fontFamily: FONT, fontSize: 13, color: C.text2, cursor: 'pointer', textDecoration: 'none',
              }} onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                 onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                {task.constituent}
              </span>
            )}
            {task.dueDate && (
              <span style={{ fontFamily: FONT, fontSize: 12, color: dc, fontWeight: isToday(task.dueDate) ? 600 : 400 }}>
                {fmtDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: C.text2, background: C.bg, padding: '3px 8px', borderRadius: 6 }}>
            {task.assignedTo}
          </span>
          <TypeBadge type={task.type} />
          <PriorityDot priority={task.priority} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: FONT, color: C.text, maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 700, margin: 0, color: C.text }}>Tasks</h1>
          <p style={{ fontFamily: FONT, fontSize: 14, color: C.text2, margin: '4px 0 0' }}>Follow-ups, calls, and meetings</p>
        </div>
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ New Task</button>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <KpiCard label="Open Tasks" value={kpis.open} />
        <KpiCard label="Due Today" value={kpis.dueToday} color={kpis.dueToday > 0 ? C.warning : undefined} />
        <KpiCard label="Overdue" value={kpis.overdue} color={kpis.overdue > 0 ? C.danger : undefined} />
        <KpiCard label="Completed This Week" value={kpis.completedWeek} color={C.success} />
      </div>

      {/* Filter Bar */}
      <div style={{ ...cardStyle, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {/* Status pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all', 'All'], ['open', 'Open'], ['overdue', 'Overdue'], ['completed', 'Completed']].map(([val, lbl]) => (
            <Pill key={val} label={lbl} active={statusFilter === val} onClick={() => setStatusFilter(val)} />
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: C.border }} />

        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all', 'All'], ['call', 'Call'], ['email', 'Email'], ['meeting', 'Meeting'], ['follow_up', 'Follow-up'], ['other', 'Other']].map(([val, lbl]) => (
            <Pill key={val} label={lbl} active={typeFilter === val} onClick={() => setTypeFilter(val)} />
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: C.border }} />

        {/* Assigned dropdown */}
        <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)} style={{
          ...inputStyle, width: 'auto', fontSize: 13, padding: '6px 12px', background: C.card,
        }}>
          <option value="all">All Assigned</option>
          {ASSIGNED_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Active Tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {activeTasks.length === 0 && (
          <div style={{ ...cardStyle, padding: 40, textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, fontSize: 14, color: C.muted, margin: 0 }}>No tasks to show</p>
          </div>
        )}
        {activeTasks.map(t => <TaskCard key={t.id} task={t} />)}
      </div>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div>
          <div onClick={() => setShowCompleted(!showCompleted)} style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 10, userSelect: 'none',
          }}>
            <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.text2, transition: 'transform 0.15s', display: 'inline-block', transform: showCompleted ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
            <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text2 }}>Completed</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, background: C.bg, padding: '2px 8px', borderRadius: 10 }}>{completedTasks.length}</span>
          </div>
          {showCompleted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completedTasks.map(t => <TaskCard key={t.id} task={t} />)}
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ ...cardStyle, width: 480, maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, margin: '0 0 20px', color: C.text }}>New Task</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <p style={{ ...labelStyle, marginBottom: 6 }}>Title</p>
                <input style={inputStyle} placeholder="Task title..." value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              {/* Description */}
              <div>
                <p style={{ ...labelStyle, marginBottom: 6 }}>Description</p>
                <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="Optional details..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Constituent */}
              <div>
                <p style={{ ...labelStyle, marginBottom: 6 }}>Constituent</p>
                <input style={inputStyle} placeholder="Name or email..." value={form.constituent}
                  onChange={e => setForm(f => ({ ...f, constituent: e.target.value }))} />
              </div>

              {/* Due Date + Priority row */}
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ ...labelStyle, marginBottom: 6 }}>Due Date</p>
                  <input type="date" style={inputStyle} value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ ...labelStyle, marginBottom: 6 }}>Priority</p>
                  <select style={inputStyle} value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Type + Assigned row */}
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ ...labelStyle, marginBottom: 6 }}>Type</p>
                  <select style={inputStyle} value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ ...labelStyle, marginBottom: 6 }}>Assigned To</p>
                  <select style={inputStyle} value={form.assignedTo}
                    onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                    {ASSIGNED_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button style={btnGhost} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={{ ...btnPrimary, opacity: form.title.trim() ? 1 : 0.5 }} onClick={handleCreate}>Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
