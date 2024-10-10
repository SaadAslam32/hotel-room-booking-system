import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../Api/axiosInstance';
import './BookRoom.css';

function BookRoom() {
  const { room_id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [booking, setBooking] = useState({
    check_in: '',
    check_out: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setBooking({ ...booking, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post(
        '/bookings/create',
        {
          room_id: parseInt(room_id),
          check_in: booking.check_in,
          check_out: booking.check_out,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate('/mybookings', { state: { success: 'Booking request sent successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="book-room-container">
      <div className="book-room-card">
        <h2>Book Room #{room_id}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Check-in Date</label>
            <input
              type="date"
              name="check_in"
              value={booking.check_in}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Check-out Date</label>
            <input
              type="date"
              name="check_out"
              value={booking.check_out}
              onChange={handleChange}
              required
              min={booking.check_in || new Date().toISOString().split('T')[0]}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookRoom;