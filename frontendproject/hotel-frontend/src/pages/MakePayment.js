import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../Api/axiosInstance';
import './MakePayment.css';

function MakePayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        `/payments/pay/${id}`,
        { amount, method },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/mypayments', { state: { success: 'Payment successful!' } });
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="make-payment-container">
      <div className="payment-form-card">
        <h2>Make Payment</h2>
        <p className="payment-instructions">
          Please enter your payment details below
        </p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handlePayment} className="payment-form">
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              step="any"
            />
          </div>
          
          <div className="form-group">
            <label>Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
            >
              <option value="card">Credit/Debit Card</option>
              <option value="easypaisa">Easypaisa</option>
              <option value="jazzcash">JazzCash</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Processing...' : 'Submit Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MakePayment;