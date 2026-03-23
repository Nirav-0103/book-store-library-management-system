import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getUsersAPI, createUserAPI, updateUserAPI, deleteUserAPI, toggleUserAPI } from '../../api';

const ROLES = ['admin', 'librarian', 'member'];
const defaultForm = { name: '', email: '', password: '', role: 'member', phone: '' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [search, roleFilter]);

  const load = async () => {
    try { setLoading(true); const r = await getUsersAPI({ search, role: roleFilter }); setUsers(r.data.data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' });
    setShowModal(true);
  };
  const close = () => { setShowModal(false); setEditing(null); setForm(defaultForm); };
  const hc = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) { await updateUserAPI(editing._id, form); toast.success('User updated!'); }
      else { await createUserAPI(form); toast.success('User created!'); }
      close(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.name}"?`)) return;
    try { await deleteUserAPI(u._id); toast.success('User deleted!'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  const handleToggle = async (u) => {
    try { await toggleUserAPI(u._id); toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}!`); load(); }
    catch { toast.error('Failed'); }
  };

  const roleBadge = (r) => {
    if (r === 'admin') return 'ap-badge--red';
    if (r === 'librarian') return 'ap-badge--gold';
    return 'ap-badge--blue';
  };

  return (
    <div className="page-enter">
      <div className="ap-header">
        <h1 className="ap-title">👥 User Management</h1>
        <button className="ap-btn ap-btn--gold" onClick={openAdd}>+ Add User</button>
      </div>

      <div className="ap-table-box">
        <div className="ap-table-top">
          <input className="ap-search" placeholder="Search name, email..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="ap-search" style={{ width: 140 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <span className="ap-count">{users.length} users</span>
        </div>

        {loading ? <div className="ap-loading"><div className="spinner" /></div>
          : users.length === 0 ? <div className="ap-empty"><div className="ap-empty-icon">👥</div><p>No users found</p></div>
          : (
            <table className="ap-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Membership</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={`ap-badge ${roleBadge(u.role)}`}>{u.role}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{u.membershipId || '—'}</td>
                    <td><span className={`ap-badge ${u.isActive ? 'ap-badge--green' : 'ap-badge--red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div className="ap-actions">
                        <button className="ap-btn ap-btn--ghost ap-btn--sm" onClick={() => openEdit(u)}>✏️</button>
                        <button className={`ap-btn ap-btn--sm ${u.isActive ? 'ap-btn--danger' : 'ap-btn--success'}`} onClick={() => handleToggle(u)}>{u.isActive ? '🚫' : '✅'}</button>
                        <button className="ap-btn ap-btn--danger ap-btn--sm" onClick={() => handleDelete(u)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {showModal && (
        <div className="ap-modal-overlay" onClick={close}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div className="ap-modal-title">{editing ? 'Edit User' : 'Add New User'}</div>
            <form onSubmit={handleSubmit} className="ap-form">
              <div className="ap-form-grid">
                <div className="ap-form-group ap-form-full">
                  <label className="ap-form-label">Full Name *</label>
                  <input className="ap-form-input" name="name" value={form.name} onChange={hc} required placeholder="Full name" />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Email *</label>
                  <input className="ap-form-input" type="email" name="email" value={form.email} onChange={hc} required placeholder="email@example.com" />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Phone</label>
                  <input className="ap-form-input" name="phone" value={form.phone} onChange={hc} placeholder="+91 98765 43210" />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Role</label>
                  <select className="ap-form-input" name="role" value={form.role} onChange={hc}>
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">{editing ? 'New Password (optional)' : 'Password *'}</label>
                  <input className="ap-form-input" type="password" name="password" value={form.password} onChange={hc} placeholder={editing ? 'Leave blank to keep' : 'Min 6 characters'} required={!editing} />
                </div>
              </div>
              <div className="ap-form-actions">
                <button type="button" className="ap-btn ap-btn--ghost" onClick={close}>Cancel</button>
                <button type="submit" className="ap-btn ap-btn--gold" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
