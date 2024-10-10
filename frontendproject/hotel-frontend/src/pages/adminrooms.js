import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './AdminRooms.css';

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/rooms/getall", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch rooms");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRooms();
    } catch (err) {
      alert("Error deleting room");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-rooms-wrapper">
      <div className="admin-rooms-container">
        <div className="rooms-header">
          <h1>Room Management</h1>
          <button 
            onClick={() => navigate("/rooms/add")} 
            className="add-room-btn"
          >
            + Add New Room
          </button>
        </div>

        <div className="rooms-table-container">
          <table className="rooms-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Room Number</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, index) => (
                <tr key={room.room_id}>
                  <td>{index + 1}</td>
                  <td>{room.room_number}</td>
                  <td>{room.room_type}</td>
                  <td>${room.price}</td>
                  <td>
                    <span className={`status-badge ${room.status}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => navigate(`/edit-room/${room.room_id}`)} 
                      className="action-btn edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(room.room_id)} 
                      className="action-btn delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminRooms;