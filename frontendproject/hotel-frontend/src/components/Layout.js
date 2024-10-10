import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo" onClick={() => navigate('/dashboard')}>
          <span className="logo-icon">🏨</span>
          <span className="logo-text">HotelEase</span>
        </div>
        
        <nav className="main-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/mybookings">My Bookings</Link>
          <Link to="/mypayments">Payments</Link>
          {token && <button onClick={handleLogout} className="logout-btn">Logout</button>}
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} HotelEase. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;