import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import API from './services/api';
import { Navbar } from './components/Navbar';
import { StatCards } from './components/StatCards';
import { FilterBar } from './components/FilterBar';
import { TaskCard } from './components/TaskCard';
import { TaskFormModal } from './components/TaskFormModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { CheckSquare, Plus, ArrowRight, ShieldCheck, Database, Layout } from 'lucide-react';

export function App() {
  const { user, loading: authLoading } = useAuth();
  
  // Dashboard states
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  
  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch Tasks from Backend REST API
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingTasks(true);
      const params = {
        search,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        sort
      };
      const res = await API.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      addToast('Error fetching tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, [user, search, statusFilter, priorityFilter, categoryFilter, sort]);

  // Fetch Stats from Backend REST API
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await API.get('/tasks/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchStats();
    }
  }, [user, fetchTasks, fetchStats]);

  // Handle Create or Update Task
  const handleSaveTask = async (formData) => {
    try {
      if (editingTask) {
        const res = await API.put(`/tasks/${editingTask._id}`, formData);
        if (res.data.success) {
          addToast('Task updated successfully!', 'success');
        }
      } else {
        const res = await API.post('/tasks', formData);
        if (res.data.success) {
          addToast('New task created!', 'success');
        }
      }
      fetchTasks();
      fetchStats();
    } catch (err) {
      throw err;
    }
  };

  // Handle Quick Status Toggle
  const handleToggleStatus = async (task) => {
    const statusCycle = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending'
    };
    const nextStatus = statusCycle[task.status] || 'pending';

    try {
      // Optimistic state update
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));
      
      const res = await API.put(`/tasks/${task._id}`, { status: nextStatus });
      if (res.data.success) {
        fetchStats();
        addToast(`Task moved to ${nextStatus.replace('_', ' ')}`, 'info');
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
      fetchTasks();
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await API.delete(`/tasks/${taskId}`);
      if (res.data.success) {
        addToast('Task deleted', 'info');
        fetchTasks();
        fetchStats();
      }
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading TaskPulse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar onOpenAuth={handleOpenAuth} onOpenNewTask={handleOpenNewTask} />

      <main className="main-content">
        {user ? (
          <>
            {/* Authenticated Dashboard View */}
            <StatCards stats={stats} />

            <FilterBar
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={stats?.categories || []}
              sort={sort}
              setSort={setSort}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* Task Grid / List Rendering */}
            {loadingTasks ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Fetching tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', margin: '2rem 0' }}>
                <CheckSquare size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>No tasks found</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
                  {search || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'No tasks match your current filters. Try resetting search or filters.'
                    : 'Your workspace is currently empty. Get started by adding your first task!'}
                </p>
                <button className="btn btn-primary" onClick={handleOpenNewTask}>
                  <Plus size={16} />
                  <span>Create First Task</span>
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'task-grid' : 'task-list-view'}>
                {tasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleOpenEditTask}
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Customer-Centric Unauthenticated Landing View */
          <div style={{ padding: '3rem 0', textAlign: 'center', maxWidth: '960px', margin: '0 auto' }}>
            
            <span className="badge" style={{ background: 'var(--accent-gradient)', color: '#fff', padding: '0.5rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.02em', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' }}>
              ✨ Smart Productivity Engine • Designed for Focus
            </span>

            <h2 style={{ fontSize: '3.25rem', fontWeight: '800', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--accent-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Organize Your Work. Master Your Focus.<br />Achieve More Every Day.
            </h2>

            <p style={{ fontSize: '1.1875rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto 2.5rem' }}>
              TaskPulse brings effortless clarity to your personal and team workflows. Track priorities, meet deadlines, and celebrate daily progress with an ultra-clean, intelligent workspace.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
              <button className="btn btn-primary" style={{ padding: '0.875rem 2.25rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' }} onClick={() => handleOpenAuth('register')}>
                <span>Start Organizing Free</span>
                <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' }} onClick={() => handleOpenAuth('login')}>
                <span>⚡ Try Live Demo</span>
              </button>
            </div>

            {/* Interactive Visual Dashboard Mockup Preview */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '4rem', textAlign: 'left', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: '600' }}>TaskPulse Workspace Preview</span>
                </div>
                <span className="badge badge-completed">Live Interactive Workspace</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color-light)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tasks Completed Today</p>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>12 Tasks (85%)</h4>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color-light)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Priority Goal</p>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-primary)' }}>Sprint Review</h4>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--success-bg)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', fontSize: '10px' }}>✓</div>
                    <span style={{ fontWeight: '700', fontSize: '0.9375rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>Finalize Q4 Product Roadmap & Goals</span>
                  </div>
                  <span className="badge badge-completed">Done</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }} />
                    <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>Review Design Assets with Marketing Team</span>
                  </div>
                  <span className="badge badge-in_progress">In Progress</span>
                </div>
              </div>
            </div>

            {/* Customer Value Feature Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <ShieldCheck size={26} color="#6366f1" />
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>Private & Secure</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Your goals, notes, and milestones are strictly isolated and encrypted for your peace of mind.</p>
              </div>

              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Database size={26} color="#10b981" />
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>Smart Priority Filters</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Search across projects, filter by urgency, and organize tasks by custom categories effortlessly.</p>
              </div>

              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Layout size={26} color="#f59e0b" />
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>Real-time Analytics</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Visual KPI metric cards celebrate your daily progress and keep your team momentum high.</p>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Modals & Toast overlays */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      <TaskFormModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleSaveTask}
        initialData={editingTask}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
