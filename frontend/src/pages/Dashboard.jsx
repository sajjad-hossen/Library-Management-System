import { useState, useEffect } from 'react';
import { BookOpen, Users, Repeat, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

const API = 'http://localhost:5044/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ books: '-', activeborrows: '-', overdue: '-' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, activeRes, overdueRes] = await Promise.all([
          fetch(`${API}/books`),
          fetch(`${API}/borrow/active`),
          fetch(`${API}/borrow/overdue`)
        ]);
        const books = await booksRes.json();
        const active = await activeRes.json();
        const overdue = await overdueRes.json();
        setStats({ books: books.length, activeborrows: active.length, overdue: overdue.length });
      } catch {
        setStats({ books: 'N/A', activeborrows: 'N/A', overdue: 'N/A' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Books', value: stats.books, icon: BookOpen, color: 'var(--primary-color)', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Active Borrows', value: stats.activeborrows, icon: Repeat, color: 'var(--success-color)', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Overdue Returns', value: stats.overdue, icon: AlertTriangle, color: 'var(--danger-color)', bg: 'rgba(239,68,68,0.12)' },
  ];

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to the Library Management System</p>
      </div>

      <div className="stats-grid">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card glass-panel">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={24} color={color} />
            </div>
            <div className="stat-body">
              <span className="stat-value" style={{ color }}>
                {loading ? '...' : value}
              </span>
              <span className="stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
