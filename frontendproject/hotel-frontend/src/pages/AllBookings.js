// src/pages/AllBookings.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../Api/axiosInstance';
import './AdminBookings.css';

function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/bookings/all', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBookings(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch bookings");
      }
    };

    fetchAllBookings();
  }, []);

  return (
    <div className="admin-bookings-container">
      <h2>All Bookings (Admin)</h2>
      {error && <p className="error">{error}</p>}
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
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
              <th>Created At</th>
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
                <td>{new Date(booking.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllBookings;
