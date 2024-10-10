import React, { useEffect, useState } from 'react';
import axios from '../Api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Icons
import { FaHotel, FaCalendarAlt, FaClock, FaMoneyBillWave, FaSearch, FaClipboardList, FaWallet, FaPlus } from 'react-icons/fa';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get('/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    };
    fetchDashboard();
  }, []);

  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div className="loading-spinner"></div>;

  return (
    <div className="dashboard-container">
      {/* Animated Background */}
      <div className="dashboard-background"></div>
      
      {/* Glassmorphism Content Container */}
      <div className="dashboard-glass-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, <span className="highlight">{user.name}</span>!</h1>
          <p className="welcome-subtext">Manage your hotel experience with ease</p>
          <div className="user-badge">
            <span className="user-role">{user.role.toUpperCase()}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="action-grid">
            {user.role === 'admin' ? (
              <>
                <ActionCard 
                  icon={<FaHotel className="action-icon" />}
                  title="Manage Rooms"
                  description="View, add or edit rooms"
                  onClick={() => navigate('/rooms/getall')}
                  color="#4e54c8"
                />
                <ActionCard 
                  icon={<FaCalendarAlt className="action-icon" />}
                  title="View Bookings"
                  description="See all reservations"
                  onClick={() => navigate('/allbookings')}
                  color="#8f94fb"
                />
                <ActionCard 
                  icon={<FaClock className="action-icon" />}
                  title="Pending Bookings"
                  description="Approve or cancel"
                  onClick={() => navigate('/pendingbookings')}
                  color="#ff7b54"
                />
                <ActionCard 
                  icon={<FaMoneyBillWave className="action-icon" />}
                  title="View Payments"
                  description="Financial records"
                  onClick={() => navigate('/allpayments')}
                  color="#6bcb77"
                />
              </>
            ) : (
              <>
                <ActionCard 
                  icon={<FaSearch className="action-icon" />}
                  title="Find Rooms"
                  description="Browse accommodations"
                  onClick={() => navigate('/rooms/getCustomer')}
                  color="#4e54c8"
                />
                <ActionCard 
                  icon={<FaClipboardList className="action-icon" />}
                  title="My Bookings"
                  description="Your reservations"
                  onClick={() => navigate('/mybookings')}
                  color="#8f94fb"
                />
                <ActionCard 
                  icon={<FaWallet className="action-icon" />}
                  title="My Payments"
                  description="Transaction history"
                  onClick={() => navigate('/mypayments')}
                  color="#ff7b54"
                />
                <ActionCard 
                  icon={<FaPlus className="action-icon" />}
                  title="New Booking"
                  description="Book a room now"
                  onClick={() => navigate('/rooms/getCustomer')}
                  color="#6bcb77"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ActionCard = ({ icon, title, description, onClick, color }) => (
  <div 
    className="action-card" 
    onClick={onClick}
    style={{ '--card-color': color }}
  >
    <div className="card-icon-container" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
    <div className="card-hover-effect"></div>
  </div>
);

export default Dashboard;