import React, { useState } from 'react';
import axios from '../Api/axiosInstance.js';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserTag } from 'react-icons/fa';
import './Signup.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phonenumber: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/signup', formData);
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed');
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-background"></div>
      <div className="signup-glass-card">
        <div className="signup-header">
          <h2>Create Your Account</h2>
          <p>Join our luxury hotel experience</p>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input 
              name="name" 
              placeholder="Full Name" 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input 
              name="email" 
              placeholder="Email" 
              type="email" 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="input-group">
            <FaLock className="input-icon" />
            <input 
              name="password" 
              placeholder="Password" 
              type="password" 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="input-group">
            <FaPhone className="input-icon" />
            <input 
              name="phonenumber" 
              placeholder="Phone Number" 
              onChange={handleChange} 
              required 
            />
          </div>
          
         
          <button type="submit" className="signup-btn">
            Register Now
          </button>
        </form>
        
        {message && <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</div>}
        
        <p className="login-link">
          Already have an account? <span onClick={() => navigate('/login')}>Login here</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;