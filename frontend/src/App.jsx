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
          /* Unauthenticated Landing View */
          <div style={{ padding: '4rem 0', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            
            <span className="badge" style={{ background: 'var(--accent-gradient)', color: '#fff', padding: '0.4rem 1rem', marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
              Full-Stack MVC Node.js + Express + MongoDB Architecture
            </span>

            <h2 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
              User-Isolated Task Management Built for Teams
            </h2>

            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Manage tasks with user-based JWT access control, Express MVC controller separation, password hashing with bcrypt, and a responsive glassmorphism UI.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
              <button className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }} onClick={() => handleOpenAuth('login')}>
                <span>Sign In to Demo Workspace</span>
                <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }} onClick={() => handleOpenAuth('register')}>
                <span>Create New Account</span>
              </button>
            </div>

            {/* Architecture Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <ShieldCheck size={32} color="#6366f1" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Secure JWT & Bcrypt</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Salted password hashing & stateless JWT token validation on all private routes.</p>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <Database size={32} color="#10b981" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Mongoose Schemas</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Structured User & Task relational MongoDB models with auto-indexing.</p>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <Layout size={32} color="#f59e0b" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Strict MVC Pattern</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Clean separation between models, controllers, middleware, and views.</p>
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
