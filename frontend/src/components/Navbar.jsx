import { NavLink } from 'react-router-dom';
import { Book, Library, Repeat, Users } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="brand">
          <Library className="brand-icon" />
          <span>LibrarySystem</span>
        </div>
        <div className="nav-links">
          <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          <NavLink to="/books" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            <Book size={18} /> Books
          </NavLink>
          <NavLink to="/members" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            <Users size={18} /> Members
          </NavLink>
          <NavLink to="/borrow" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            <Repeat size={18} /> Borrow/Return
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
