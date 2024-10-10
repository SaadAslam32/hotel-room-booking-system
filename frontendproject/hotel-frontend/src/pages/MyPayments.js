import React, { useEffect, useState } from 'react';
import axiosInstance from '../Api/axiosInstance';
import './Mypayment.css';

function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/payments/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayments(res.data.payments);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load payments");
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-payments-container">
      <h1>My Payment History</h1>
      
      {payments.length === 0 ? (
        <div className="no-payments">
          <p>No payment history found.</p>
        </div>
      ) : (
        <div className="payments-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id}>
                  <td>{payment.payment_id}</td>
                  <td>{payment.booking_id}</td>
                  <td>PKR {payment.amount}</td>
                  <td className="payment-method">
                    <span className={`method-badge ${payment.method}`}>
                      {payment.method}
                    </span>
                  </td>
                  <td>{new Date(payment.paid_at).toLocaleString()}</td>
                  <td>
                    <span className="status-badge completed">Completed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyPayments;