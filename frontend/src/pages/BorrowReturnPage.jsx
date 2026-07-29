import { useState, useEffect } from 'react';
import { ArrowRightLeft, BookMarked, RotateCcw, Loader2, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import './BorrowReturnPage.css';

const BORROW_API = 'http://localhost:5044/api/borrow';
const BOOKS_API  = 'http://localhost:5044/api/books';

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

export default function BorrowReturnPage() {
  // All books (for dropdowns)
  const [allBooks, setAllBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);

  // Borrow form state
  const [selectedBorrowBookId, setSelectedBorrowBookId] = useState('');
  const [borrowForm, setBorrowForm] = useState({ bookCopyId: '', memberMobile: '', dueDays: 14 });
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowResult, setBorrowResult] = useState({ type: '', message: '' });

  // Return form state
  const [returnForm, setReturnForm] = useState({ memberMobile: '', bookId: '' });
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnResult, setReturnResult] = useState({ type: '', message: '' });

  const fetchAllBooks = async () => {
    setBooksLoading(true);
    try {
      const res = await fetch(BOOKS_API);
      if (res.ok) {
        const data = await res.json();
        setAllBooks(data);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setBooksLoading(false);
    }
  };

  useEffect(() => { fetchAllBooks(); }, []);

  // Available books (for borrow dropdown)
  const availableBooks = allBooks.filter(b => b.availableCopyIds && b.availableCopyIds.length > 0);

  const handleBorrowBookSelect = (e) => {
    const bookId = e.target.value;
    setSelectedBorrowBookId(bookId);
    if (bookId) {
      const book = availableBooks.find(b => String(b.id) === bookId);
      setBorrowForm(f => ({ ...f, bookCopyId: book?.availableCopyIds?.[0] ?? '' }));
    } else {
      setBorrowForm(f => ({ ...f, bookCopyId: '' }));
    }
  };

  const handleBorrow = async () => {
    if (!borrowForm.bookCopyId || !borrowForm.memberMobile) {
      setBorrowResult({ type: 'error', message: 'Please select a book and enter the member mobile number.' });
      return;
    }
    setBorrowLoading(true);
    setBorrowResult({ type: '', message: '' });
    try {
      const res = await fetch(`${BORROW_API}/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookCopyId: +borrowForm.bookCopyId, memberMobile: borrowForm.memberMobile, dueDays: +borrowForm.dueDays })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process borrow.');
      setBorrowResult({ type: 'success', message: `✅ "${data.bookTitle}" issued to ${data.memberName}. Due: ${new Date(data.dueDate).toLocaleDateString()}` });
      setSelectedBorrowBookId('');
      setBorrowForm({ bookCopyId: '', memberMobile: '', dueDays: 14 });
      fetchAllBooks();
    } catch (err) {
      setBorrowResult({ type: 'error', message: err.message });
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!returnForm.memberMobile || !returnForm.bookId) {
      setReturnResult({ type: 'error', message: 'Please enter the mobile number and select the book to return.' });
      return;
    }
    setReturnLoading(true);
    setReturnResult({ type: '', message: '' });
    try {
      const res = await fetch(`${BORROW_API}/return-by-mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberMobile: returnForm.memberMobile, bookId: +returnForm.bookId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process return.');
      const fine = data.fineAmount > 0 ? ` Fine: $${data.fineAmount.toFixed(2)}` : ' No fine.';
      setReturnResult({ type: 'success', message: `✅ "${data.bookTitle}" returned by ${data.memberName}.${fine} Available copies updated.` });
      setReturnForm({ memberMobile: '', bookId: '' });
      fetchAllBooks(); // Refresh — returned book reappears in borrow dropdown
    } catch (err) {
      setReturnResult({ type: 'error', message: err.message });
    } finally {
      setReturnLoading(false);
    }
  };

  const selectedBorrowBook = availableBooks.find(b => String(b.id) === selectedBorrowBookId);

  return (
    <div className="borrow-page">
      <div className="page-header-row">
        <ArrowRightLeft size={28} color="var(--primary-color)" />
        <h1>Borrow &amp; Return</h1>
      </div>

      <div className="borrow-grid">
        {/* Issue Book */}
        <div className="glass-panel borrow-panel">
          <div className="panel-title">
            <BookMarked size={20} color="var(--primary-color)" />
            <h2>Issue a Book</h2>
          </div>
          <p className="panel-desc">Select an available book and enter the member's mobile number.</p>

          <Alert type={borrowResult.type} message={borrowResult.message} />

          <div className="form-field">
            <label>Select Book</label>
            {booksLoading ? (
              <div className="dropdown-loading"><Loader2 size={16} className="spin" /> Loading books…</div>
            ) : (
              <select value={selectedBorrowBookId} onChange={handleBorrowBookSelect} className="book-select">
                <option value="">— Choose a book —</option>
                {availableBooks.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} — {book.author} ({book.availableCopyIds.length} available)
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedBorrowBook && (
            <div className="selected-book-info">
              <BookOpen size={14} />
              <span>Copy #{selectedBorrowBook.availableCopyIds[0]} will be assigned automatically</span>
            </div>
          )}

          <div className="form-field">
            <label>Member Mobile Number</label>
            <input
              type="text"
              placeholder="e.g. 01751869601"
              value={borrowForm.memberMobile}
              onChange={e => setBorrowForm(f => ({ ...f, memberMobile: e.target.value }))}
            />
          </div>
          <div className="form-field">
            <label>Loan Duration (days)</label>
            <input
              type="number"
              value={borrowForm.dueDays}
              min={1}
              max={60}
              onChange={e => setBorrowForm(f => ({ ...f, dueDays: e.target.value }))}
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleBorrow} disabled={borrowLoading || !selectedBorrowBookId}>
            {borrowLoading ? <Loader2 size={16} className="spin" /> : null}
            {borrowLoading ? 'Processing...' : 'Process Borrow'}
          </button>
        </div>

        {/* Return Book */}
        <div className="glass-panel borrow-panel">
          <div className="panel-title">
            <RotateCcw size={20} color="var(--success-color)" />
            <h2>Return a Book</h2>
          </div>
          <p className="panel-desc">Enter the member's mobile number and select the book being returned. Fines are calculated automatically and the copy count will increase.</p>

          <Alert type={returnResult.type} message={returnResult.message} />

          <div className="form-field">
            <label>Member Mobile Number</label>
            <input
              type="text"
              placeholder="e.g. 01751869601"
              value={returnForm.memberMobile}
              onChange={e => setReturnForm(f => ({ ...f, memberMobile: e.target.value }))}
            />
          </div>

          <div className="form-field">
            <label>Select Book to Return</label>
            {booksLoading ? (
              <div className="dropdown-loading"><Loader2 size={16} className="spin" /> Loading books…</div>
            ) : (
              <select
                value={returnForm.bookId}
                onChange={e => setReturnForm(f => ({ ...f, bookId: e.target.value }))}
                className="book-select"
              >
                <option value="">— Choose a book —</option>
                {allBooks.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} — {book.author}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            className="btn"
            style={{ width: '100%', background: 'rgba(16,185,129,0.15)', border: '1px solid var(--success-color)', color: 'var(--success-color)' }}
            onClick={handleReturn}
            disabled={returnLoading || !returnForm.memberMobile || !returnForm.bookId}
          >
            {returnLoading ? <Loader2 size={16} className="spin" /> : null}
            {returnLoading ? 'Processing...' : 'Process Return'}
          </button>
        </div>
      </div>
    </div>
  );
}
