// src/pages/PendingBookings.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../Api/axiosInstance';
import './AdminBookings.css';

function PendingBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get('/bookings/allPendings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBookings(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending bookings");
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    setLoading(true);
    const endpoint = `/bookings/${id}/${action}`;
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.put(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert(res.data.message);
      fetchPending(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action}`);
    }
    setLoading(false);
  };

  return (
    <div className="admin-bookings-container">
      <h2>Pending Bookings</h2>
      {error && <p className="error">{error}</p>}
      {bookings.length === 0 ? (
        <p>No pending bookings found.</p>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Room</th>
              <th>Type</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.booking_id}>
                <td>{booking.booking_id}</td>
                <td>{booking.customer_name}</td>
                <td>{booking.room_number}</td>
                <td>{booking.room_type}</td>
                <td>{booking.check_in}</td>
                <td>{booking.check_out}</td>
                <td>
                  <button
                    className="approve-btn"
                    disabled={loading}
                    onClick={() => handleAction(booking.booking_id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    className="cancel-btn"
                    disabled={loading}
                    onClick={() => handleAction(booking.booking_id, 'cancel')}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PendingBookings;
