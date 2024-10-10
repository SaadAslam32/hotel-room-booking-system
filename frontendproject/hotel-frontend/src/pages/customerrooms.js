import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './CustomerRooms.css';

// Room type images
const roomImages = {
  Standard: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
  Deluxe: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
  Suite: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
  Family: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
  Executive: 'https://images.unsplash.com/photo-1564078516393-cf04bd966897?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
};

function CustomerRooms() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("All");
  const navigate = useNavigate();

  const roomTypes = [
    { value: "All", label: "All Room Types" },
    { value: "Standard", label: "Standard" },
    { value: "Deluxe", label: "Deluxe" },
    { value: "Suite", label: "Suite" },
    { value: "Family", label: "Family" },
    { value: "Executive", label: "Executive" }
  ];

  // ✅ Clean image picker based on exact match
  const getRoomImage = (roomType) => {
    const formatted = roomType.charAt(0).toUpperCase() + roomType.slice(1).toLowerCase();
    return roomImages[formatted] || roomImages.Standard;
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/rooms/getall", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
      setFilteredRooms(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch rooms");
      setLoading(false);
    }
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    
    if (type === "All") {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter(room => 
        room.room_type.toLowerCase() === type.toLowerCase()
      );
      setFilteredRooms(filtered);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="customer-rooms-wrapper">
      <div className="customer-rooms-container">
        <div className="rooms-header">
          <h1>Our Beautiful Rooms</h1>
          <p className="rooms-subtitle">Experience luxury and comfort in our carefully designed accommodations</p>
          
          <div className="room-type-filter">
            <label htmlFor="roomType">Filter by Room Type:</label>
            <select 
              id="roomType"
              value={selectedType}
              onChange={handleTypeChange}
              className="room-type-select"
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rooms-grid">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <div key={room.room_id} className="room-card">
                <div className="room-image-container">
                  <img 
                    src={room.image || getRoomImage(room.room_type)} 
                    alt={room.room_type} 
                    className="room-image"
                  />
                  <div className={`room-status ${room.status}`}>{room.status}</div>
                  <div className="room-price-tag">${room.price}/night</div>
                </div>
                <div className="room-details">
                  <h3 className="room-title">Room #{room.room_number}</h3>
                  <p className="room-type">{room.room_type}</p>
                  <p className="room-description">
                    {room.description || 'Spacious room with modern amenities for a comfortable stay'}
                  </p>
                  
                  <div className="room-features">
                    <span className="feature">🛏️ King Bed</span>
                    <span className="feature">🚿 Private Bath</span>
                    <span className="feature">📶 Free WiFi</span>
                  </div>
                  
                  {room.status === "available" ? (
                    <button 
                      onClick={() => navigate(`/book-room/${room.room_id}`)}
                      className="book-btn"
                    >
                      Book Now
                    </button>
                  ) : (
                    <button className="book-btn unavailable" disabled>
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-rooms-message">
              No rooms found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerRooms;
