import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../Api/axiosInstance';
import './RoomForm.css';

function EditRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const roomTypes = location.state?.roomTypes || [
    { value: "Sandard", label: "Standard Room" },
    { value: "Deluxe", label: "Deluxe Room" },
    { value: "Suite", label: "Suite" },
    { value: "Family", label: "Family Room" },
    { value: "Executive", label: "Executive Suite" }
  ];

  const [room, setRoom] = useState({
    room_number: '',
    room_type: roomTypes[0]?.value || '',
    price: '',
    description: '',
    image: '',
    status: 'available',
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axiosInstance.get(`/rooms/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRoom(response.data);
      } catch (error) {
        console.error('Error fetching room:', error);
        alert('Failed to load room data');
      }
    };

    fetchRoom();
  }, [id, token]);

  const handleChange = (e) => {
    setRoom({ ...room, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/rooms/${id}`, room, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Room updated successfully');
      navigate('/rooms/getall');
    } catch (error) {
      console.error('Update failed:', error);
      alert(error.response?.data?.message || 'Failed to update room');
    }
  };

  return (
    <div className="room-form-page">
      <div className="room-form-container glassmorphism">
        <h2>Edit Room</h2>
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
            <select
              name="room_type"
              value={room.room_type}
              onChange={handleChange}
              required
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Price per Night ($):</label>
            <input 
              type="number" 
              name="price" 
              value={room.price} 
              onChange={handleChange} 
              required 
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea 
              name="description" 
              value={room.description} 
              onChange={handleChange} 
              rows="4"
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
            <select 
              name="status" 
              value={room.status} 
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Update Room
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

export default EditRoom;