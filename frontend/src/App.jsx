import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BooksPage from './pages/BooksPage';
import BorrowReturnPage from './pages/BorrowReturnPage';
import MembersPage from './pages/MembersPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/borrow" element={<BorrowReturnPage />} />
            <Route path="/members" element={<MembersPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
