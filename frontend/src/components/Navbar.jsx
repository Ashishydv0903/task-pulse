import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Moon, Sun, LogOut, Plus, User } from 'lucide-react';

export const Navbar = ({ onOpenAuth, onOpenNewTask }) => {
  const { user, logout, theme, toggleTheme } = useAuth();

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, sticky: 'top', zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <CheckSquare size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TaskPulse
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              MVC User-Based Workspace
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme Toggle Button */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            style={{ borderRadius: '50%', padding: '0.6rem' }}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {user ? (
            <>
              <button className="btn btn-primary" onClick={onOpenNewTask}>
                <Plus size={16} />
                <span>New Task</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'var(--bg-secondary)', padding: '0.375rem 0.875rem 0.375rem 0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8125rem', fontWeight: '700' }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <button className="btn-icon" onClick={logout} title="Sign Out" style={{ padding: '0.2rem', marginLeft: '0.25rem' }}>
                  <LogOut size={15} color="var(--text-muted)" />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => onOpenAuth('login')}>
                Log In
              </button>
              <button className="btn btn-primary" onClick={() => onOpenAuth('register')}>
                Get Started
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
