import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../Api/axiosInstance';
import './PaymentDetails.css';

function PaymentDetails() {
  const { booking_id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`payments/get-details/${booking_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDetails(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load payment details");
        setLoading(false);
      }
    };

    fetchDetails();
  }, [booking_id]);

  const handleMakePayment = () => {
    navigate(`/make-payment/${booking_id}`);
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="payment-details-container">
      <div className="payment-details-card">
        <h2>Payment Details for Booking #{booking_id}</h2>
        
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Room Number:</span>
            <span className="detail-value">{details.room_number}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Check-in Date:</span>
            <span className="detail-value">
              {new Date(details.check_in).toLocaleDateString()}
            </span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Check-out Date:</span>
            <span className="detail-value">
              {new Date(details.check_out).toLocaleDateString()}
            </span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Price per Night:</span>
            <span className="detail-value">$ {details.price_per_night}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Number of Nights:</span>
            <span className="detail-value">{details.nights}</span>
          </div>
          
          <div className="detail-item total">
            <span className="detail-label">Total Amount:</span>
            <span className="detail-value">$ {details.total_amount}</span>
          </div>
        </div>
        
        <button onClick={handleMakePayment} className="proceed-btn">
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}

export default PaymentDetails;