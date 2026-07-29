import { useState, useEffect } from 'react';
import { Users, UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import './MembersPage.css';

const API = 'http://localhost:5044/api/members';

function Alert({ type, message }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}>
      {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {message}
    </div>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', mobileNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState({ type: '', message: '' });

  const fetchMembers = async () => {
    try {
      const res = await fetch(API);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.mobileNumber) {
      setResult({ type: 'error', message: 'All fields are required.' });
      return;
    }

    setSubmitting(true);
    setResult({ type: '', message: '' });

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to register member.');
      
      setResult({ type: 'success', message: `✅ Member ${data.firstName} registered successfully!` });
      setForm({ firstName: '', lastName: '', email: '', mobileNumber: '' });
      fetchMembers(); // Refresh list
    } catch (err) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="members-page">
      <div className="page-header-row">
        <Users size={28} color="var(--primary-color)" />
        <h1>Members Management</h1>
      </div>

      <div className="members-grid">
        <div className="glass-panel member-panel">
          <div className="panel-title">
            <UserPlus size={20} color="var(--primary-color)" />
            <h2>Register New Member</h2>
          </div>
          <p className="panel-desc">Fill in the details to add a new member to the library system.</p>

          <Alert type={result.type} message={result.message} />

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane"
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Doe"
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label>Email (Gmail)</label>
                <input
                  type="email"
                  placeholder="e.g. jane.doe@gmail.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label>Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. 01751869601"
                  value={form.mobileNumber}
                  onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))}
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? <Loader2 size={16} className="spin" /> : null}
              {submitting ? 'Registering...' : 'Register Member'}
            </button>
          </form>
        </div>

        <div className="member-list">
          <h2>Registered Members</h2>
          {loading ? (
            <p>Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-secondary">No members found.</p>
          ) : (
            <div className="members-table-container">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile Number</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id}>
                      <td>{member.firstName} {member.lastName}</td>
                      <td>{member.email}</td>
                      <td>{member.membershipNumber}</td>
                      <td>
                        <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
