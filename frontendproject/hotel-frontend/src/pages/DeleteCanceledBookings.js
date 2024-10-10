// src/pages/DeleteCanceledBookings.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../Api/axiosInstance';
import './AdminBookings.css';

function DeleteCanceledBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCanceled = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get('/bookings/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const canceled = res.data.filter(b => b.status === 'canceled');
      setBookings(canceled);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    }
  };

  useEffect(() => {
    fetchCanceled();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this booking?");
    if (!confirm) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.delete(`bookings/${id}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchCanceled();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
    setLoading(false);
  };

  return (
    <div className="admin-bookings-container">
      <h2>Delete Canceled Bookings</h2>
      {error && <p className="error">{error}</p>}
      {bookings.length === 0 ? (
        <p>No canceled bookings found.</p>
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
              <th>Status</th>
              <th>Delete</th>
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
                <td>{booking.status}</td>
                <td>
                  <button
                    className="cancel-btn"
                    disabled={loading}
                    onClick={() => handleDelete(booking.booking_id)}
                  >
                    Delete
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

export default DeleteCanceledBookings;
