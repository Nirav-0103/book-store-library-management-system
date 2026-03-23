import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isHome = location.pathname === '/';

  const handleToggle = () => {
    setToggling(true);
    setTimeout(() => setToggling(false), 600);
    toggleTheme();
  };

  const getClass = (path) => {
    if (path === '/') return 'header__link';
    if (path === '/collection') {
      return `header__link${location.pathname.startsWith('/collection') ? ' header__link--active' : ''}`;
    }
    return `header__link${location.pathname === path ? ' header__link--active' : ''}`;
  };

  return (
    <header className={`header ${scrolled || !isHome ? 'header--solid' : ''}`}>
      <div className="header__inner container">

        <Link to="/" className="header__logo">
          <span className="header__logo-icon">✦</span>
          <span className="header__logo-text">LUXE LIBRARY</span>
        </Link>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <Link to="/" className={getClass('/')}>Home</Link>
          <Link to="/collection" className={getClass('/collection')}>Collection</Link>
          <Link to="/about" className={getClass('/about')}>About</Link>
          <Link to="/contact" className={getClass('/contact')}>Contact</Link>
          {user && (
            <Link
              to={user.role === 'admin' ? '/admin' : '/dashboard'}
              className={`header__link${location.pathname.startsWith('/admin') || location.pathname === '/dashboard' ? ' header__link--active' : ''}`}
            >
              {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
            </Link>
          )}
        </nav>

        <div className="header__auth">
          {/* Theme Toggle */}
          <button
            className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'} ${toggling ? 'theme-toggle--spinning' : ''}`}
            onClick={handleToggle}
            aria-label="Toggle theme"
          >
            <span className="theme-toggle__track">
              <span className="theme-toggle__thumb">
                <span className="theme-toggle__icon">{isDark ? '🌙' : '☀️'}</span>
              </span>
            </span>
            <span className="theme-toggle__label">{isDark ? 'Dark' : 'Light'}</span>
          </button>

          {/* Cart Icon */}
          <Link to="/cart" className="header__cart" title="My Cart">
            <span className="header__cart-icon">🛒</span>
            {count > 0 && (
              <span className="header__cart-badge">{count}</span>
            )}
          </Link>

          {user ? (
            <div className="header__user">
              <div className="header__avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div className="header__user-info">
                <span className="header__user-name">{user.name}</span>
                <span className="header__user-role">{user.role}</span>
              </div>
              <button className="header__logout" onClick={handleLogout}>Sign Out</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="header__btn-ghost">Sign In</Link>
              <Link to="/signup" className="header__btn-gold">Join Now</Link>
            </>
          )}
        </div>

        <button className={`header__hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}