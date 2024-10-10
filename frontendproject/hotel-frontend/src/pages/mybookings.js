import React, { useEffect, useState } from 'react';
import axiosInstance from '../Api/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import './MyBookings.css';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.success) {
      alert(location.state.success);
      navigate(location.pathname, { replace: true, state: {} });
    }

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('bookings/mybookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bookings.");
        setLoading(false);
      }
    };

    fetchBookings();
  }, [location, navigate]);

  const handlePaymentDetails = (booking_id) => {
    navigate(`/payment-details/${booking_id}`);
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-bookings-container">
      <h1>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
          <button onClick={() => navigate('/rooms/getCustomer')} className="find-rooms-btn">
            Find Available Rooms
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.booking_id} className="booking-card">
              <div className="booking-header">
                <h3>Booking #{booking.booking_id}</h3>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="booking-details">
                <div className="detail-item">
                  <span className="detail-label">Room:</span>
                  <span className="detail-value">#{booking.room_id}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Check-in:</span>
                  <span className="detail-value">
                    {new Date(booking.check_in).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Check-out:</span>
                  <span className="detail-value">
                    {new Date(booking.check_out).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Booked on:</span>
                  <span className="detail-value">
                    {new Date(booking.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {booking.status === "confirmed" && (
                <button
                  onClick={() => handlePaymentDetails(booking.booking_id)}
                  className="payment-btn"
                >
                  View Payment Details
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;