import React, { useEffect, useState } from 'react';
import axiosInstance from '../Api/axiosInstance';
import './Payment.css';

function AllPayments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/payments/all", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPayments(res.data.payments);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load payments");
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h2 className="payment-title">All Payments (Admin View)</h2>
        {error && <p className="error">{error}</p>}
        {payments.length === 0 && !error && <p>No payments found.</p>}

        {payments.length > 0 && (
          <table className="payment-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Amount (PKR)</th>
                <th>Method</th>
                <th>Paid At</th>
                <th>Booking ID</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Room</th>
                <th>Customer</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.payment_id}>
                  <td>{p.payment_id}</td>
                  <td>{p.amount}</td>
                  <td>{p.method}</td>
                  <td>{new Date(p.paid_at).toLocaleString()}</td>
                  <td>{p.booking_id}</td>
                  <td>{new Date(p.check_in).toLocaleDateString()}</td>
                  <td>{new Date(p.check_out).toLocaleDateString()}</td>
                  <td>{p.room_id}</td>
                  <td>{p.customer_name}</td>
                  <td>{p.customer_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AllPayments;