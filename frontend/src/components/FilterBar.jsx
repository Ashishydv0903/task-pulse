import React from 'react';
import { Search, Filter, LayoutGrid, List, X } from 'lucide-react';

export const FilterBar = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  categories = [],
  sort,
  setSort,
  viewMode,
  setViewMode
}) => {
  const statusOptions = [
    { label: 'All Tasks', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      
      {/* Top Search and View Switcher */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        
        {/* Search Box */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', paddingRight: search ? '2.5rem' : '1rem' }}
          />
          {search && (
            <button
              className="btn-icon"
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', padding: '0.2rem' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Switcher & Sorting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="form-control"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
          </select>

          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <button
              className={`btn-icon ${viewMode === 'grid' ? 'btn-primary' : ''}`}
              onClick={() => setViewMode('grid')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '4px' }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`btn-icon ${viewMode === 'list' ? 'btn-primary' : ''}`}
              onClick={() => setViewMode('list')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '4px' }}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Pills and Dropdowns */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color-light)' }}>
        
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Filter size={14} /> Status:
        </span>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`btn btn-sm ${statusFilter === opt.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <select
          className="form-control"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ width: 'auto', padding: '0.35rem 2rem 0.35rem 0.75rem', fontSize: '0.8125rem' }}
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Category Filter */}
        {categories.length > 0 && (
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 2rem 0.35rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}

      </div>
    </div>
  );
};
