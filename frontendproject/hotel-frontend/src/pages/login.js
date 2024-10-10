import React, { useState } from 'react';
import axios from '../Api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/login', formData);
      const token = res.data.token;
      localStorage.setItem('token', token);
      setMessage("Login successful");

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-glass-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
        
        {message && <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</div>}
        
        <p className="signup-link">
          Don't have an account? <span onClick={() => navigate('/signup')}>Sign up here</span>
        </p>
      </div>
    </div>
  );
}

export default Login;