import React from 'react';
import { Calendar, Tag, Edit2, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';

export const TaskCard = ({ task, onEdit, onDelete, onToggleStatus, viewMode }) => {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-completed">Done</span>;
      case 'in_progress':
        return <span className="badge badge-in_progress">In Progress</span>;
      default:
        return <span className="badge badge-pending">Pending</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    return (
      <span className={`badge badge-priority-${priority}`}>
        {priority}
      </span>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
          <button
            className="btn-icon"
            onClick={() => onToggleStatus(task)}
            title="Toggle Status"
            style={{ padding: '0.2rem' }}
          >
            {isCompleted ? (
              <CheckCircle2 size={22} color="var(--success)" />
            ) : task.status === 'in_progress' ? (
              <Clock size={22} color="var(--info)" />
            ) : (
              <Circle size={22} color="var(--text-muted)" />
            )}
          </button>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h4 style={{
              fontSize: '0.9375rem',
              fontWeight: '700',
              color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {task.title}
            </h4>
            {task.description && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {getStatusBadge(task.status)}
          {getPriorityBadge(task.priority)}

          {task.category && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Tag size={12} /> {task.category}
            </span>
          )}

          {task.dueDate && (
            <span style={{ fontSize: '0.75rem', color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isOverdue ? '700' : '500', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Calendar size={12} /> {formatDate(task.dueDate)}
            </span>
          )}

          <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
            <button className="btn-icon" onClick={() => onEdit(task)} title="Edit Task">
              <Edit2 size={16} color="var(--accent-primary)" />
            </button>
            <button className="btn-icon" onClick={() => onDelete(task._id)} title="Delete Task">
              <Trash2 size={16} color="var(--danger)" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      position: 'relative',
      opacity: isCompleted ? 0.8 : 1,
      transition: 'all 0.2s ease'
    }}>
      
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <button
              className="btn-icon"
              onClick={() => onToggleStatus(task)}
              title="Toggle status"
              style={{ padding: '0.1rem' }}
            >
              {isCompleted ? (
                <CheckCircle2 size={22} color="var(--success)" />
              ) : task.status === 'in_progress' ? (
                <Clock size={22} color="var(--info)" />
              ) : (
                <Circle size={22} color="var(--text-muted)" />
              )}
            </button>

            <h4 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              lineHeight: '1.3'
            }}>
              {task.title}
            </h4>
          </div>
        </div>

        {/* Task Description */}
        {task.description && (
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div style={{ paddingTop: '0.875rem', borderTop: '1px solid var(--border-color-light)', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="btn-icon" onClick={() => onEdit(task)} title="Edit Task">
              <Edit2 size={16} color="var(--accent-primary)" />
            </button>
            <button className="btn-icon" onClick={() => onDelete(task._id)} title="Delete Task">
              <Trash2 size={16} color="var(--danger)" />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {task.category ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Tag size={12} /> {task.category}
            </span>
          ) : <span />}

          {task.dueDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isOverdue ? '700' : '500' }}>
              <Calendar size={12} /> {formatDate(task.dueDate)} {isOverdue && '(Overdue)'}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
