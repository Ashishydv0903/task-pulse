import React from 'react';
import { Layers, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export const StatCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Tasks',
      value: stats?.total || 0,
      icon: Layers,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.12)'
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      icon: Clock,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)'
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)'
    },
    {
      title: 'High Priority & Overdue',
      value: (stats?.highPriority || 0) + (stats?.overdue || 0),
      icon: AlertTriangle,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      badgeText: stats?.overdue ? `${stats.overdue} overdue` : null
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div key={idx} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                {card.title}
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {card.value}
              </h3>
              {card.badgeText && (
                <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '700', marginTop: '0.25rem', display: 'inline-block' }}>
                  ⚠️ {card.badgeText}
                </span>
              )}
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: card.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconComponent size={24} color={card.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
