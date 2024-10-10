import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="homepage">
      <header className="hero-header">
        <div className="hero-content">
          <h1>Welcome to HotelEase</h1>
          <p className="hero-subtitle">Luxury stays at affordable prices</p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        </div>
      </header>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🛏️</div>
          <h3>Comfortable Rooms</h3>
          <p>Experience premium comfort with our well-appointed rooms</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">💰</div>
          <h3>Best Prices</h3>
          <p>Competitive rates without compromising on quality</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🌟</div>
          <h3>Excellent Service</h3>
          <p>24/7 customer support for all your needs</p>
        </div>
      </section>
    </div>
  );
}

export default Home;