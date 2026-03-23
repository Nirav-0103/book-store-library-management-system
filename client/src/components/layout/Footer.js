import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-icon">✦</span>
              <span>LUXE LIBRARY</span>
            </div>
            <p className="footer__tagline">
              Where knowledge meets elegance. A curated collection for the discerning mind.
            </p>
            <div className="footer__divider" />
            <p className="footer__copy">© {new Date().getFullYear()} Luxe Library. All rights reserved.</p>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Navigate</h4>
            <ul className="footer__links">
              <li><Link to="/">Home</Link></li>
              <li><a href="/#collection">Collection</a></li>
              <li><a href="/#about">About Us</a></li>
              <li><a href="/#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Account</h4>
            <ul className="footer__links">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/signup">Register</Link></li>
              <li><Link to="/dashboard">My Dashboard</Link></li>
              <li><Link to="/admin">Admin Panel</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Visit Us</h4>
            <ul className="footer__address">
              <li>📍 123 Knowledge Street</li>
              <li>Ahmedabad, Gujarat 380001</li>
              <li>📞 +91 98765 43210</li>
              <li>✉️ info@luxelibrary.in</li>
              <li style={{ marginTop: 12 }}>🕐 Mon–Sat: 9AM – 8PM</li>
              <li>🕐 Sunday: 10AM – 5PM</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
