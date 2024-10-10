import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../Api/axiosInstance';
import './RoomForm.css';

function CreateRoom() {
  const [room, setRoom] = useState({
    room_number: '',
    room_type: '',
    price: '',
    description: '',
    image: '',
    status: 'available',
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setRoom({ ...room, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/rooms/add', room, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Room added successfully');
      navigate('/rooms/getall');
    } catch (error) {
      console.error('Room creation error:', error);
      alert(error.response?.data?.message || 'Failed to add room');
    }
  };

  return (
    <div className="room-form-page">
      <div className="room-form-container glassmorphism">
        <h2>Create New Room</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Number:</label>
            <input
              type="text"
              name="room_number"
              value={room.room_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Room Type:</label>
            <input
              type="text"
              name="room_type"
              value={room.room_type}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Price per Night ($):</label>
            <input
              type="number"
              name="price"
              value={room.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={room.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="text"
              name="image"
              value={room.image}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Status:</label>
            <select name="status" value={room.status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Create Room
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/rooms/getall')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoom;