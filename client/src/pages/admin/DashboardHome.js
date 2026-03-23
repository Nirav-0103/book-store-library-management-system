import React, { useEffect, useState } from 'react';
import { getDashboardAPI } from '../../api';
import './AdminPanel.css';

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardAPI().then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ap-loading"><div className="spinner" /></div>;
  if (!stats) return <div className="ap-loading">Failed to load.</div>;

  const cards = [
    { icon: '📚', label: 'Total Books', value: stats.totalBooks, color: '#c9a84c' },
    { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: '#5a9ce0' },
    { icon: '🪪', label: 'Members', value: stats.totalMembers, color: '#5acea0' },
    { icon: '🔄', label: 'Active Issues', value: stats.activeIssues, color: '#c99a4c' },
    { icon: '⚠️', label: 'Overdue', value: stats.overdueIssues, color: '#e05a5a' },
    { icon: '✅', label: 'Returned', value: stats.totalReturned, color: '#5acea0' },
  ];

  return (
    <div className="page-enter">
      <div className="ap-header">
        <h1 className="ap-title">Dashboard Overview</h1>
        <span style={{ fontSize: 13, color: 'var(--text3)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            background: 'var(--dark)', border: '1px solid var(--border2)',
            borderTop: `2px solid ${c.color}`,
            borderRadius: 'var(--radius-lg)', padding: '24px 20px',
            display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <span style={{ fontSize: 28 }}>{c.icon}</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 300, color: c.color, lineHeight: 1 }}>{c.value}</span>
            <span style={{ fontSize: 12, color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{c.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        {/* Recent Issues */}
        <div className="ap-table-box">
          <div className="ap-table-top"><strong style={{ fontSize: 14, color: 'var(--text)' }}>Recent Active Issues</strong></div>
          {stats.recentIssues.length === 0 ? (
            <div className="ap-empty"><div className="ap-empty-icon">📭</div><p>No active issues</p></div>
          ) : (
            <table className="ap-table">
              <thead><tr><th>Book</th><th>Member</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {stats.recentIssues.map(issue => {
                  const over = new Date(issue.dueDate) < new Date();
                  return (
                    <tr key={issue._id}>
                      <td><strong>{issue.book?.title}</strong><br /><span style={{ fontSize: 11, color: 'var(--text3)' }}>{issue.book?.author}</span></td>
                      <td>{issue.member?.name}</td>
                      <td style={{ color: over ? 'var(--red)' : 'var(--text2)', fontSize: 12 }}>{new Date(issue.dueDate).toLocaleDateString('en-IN')}</td>
                      <td><span className={`ap-badge ${over ? 'ap-badge--red' : 'ap-badge--blue'}`}>{over ? 'Overdue' : 'Issued'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Categories */}
        <div className="ap-table-box">
          <div className="ap-table-top"><strong style={{ fontSize: 14, color: 'var(--text)' }}>Books by Category</strong></div>
          <table className="ap-table">
            <thead><tr><th>Category</th><th>Count</th></tr></thead>
            <tbody>
              {stats.categoryStats.map(cat => (
                <tr key={cat._id}>
                  <td><strong>{cat._id}</strong></td>
                  <td><span className="ap-badge ap-badge--gold">{cat.count}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
