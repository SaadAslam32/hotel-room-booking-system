const express = require('express');
const { sql, poolPromise } = require("../config/db.js");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const {verifytoken,verifyrole} = require('../config/middleware.js');
const { VarChar } = require('mssql');

require('dotenv').config();
const secretkey = process.env.secretkey;

const rooms = express.Router();

//this is for the admin and customer both can get all the information of the rooms
rooms.get('/getall', verifytoken,async (req, res) => {

   
  try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Rooms");

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).json({ message: err.message });
    }
});


//now admin only can add the room 
rooms.post('/add', verifytoken, verifyrole("admin"), async (req, res) => {
    const { room_number, room_type, price, description, image, status } = req.body;

    // Validation (optional but useful)
    if (!room_number || !price || !status) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("room_number", sql.VarChar, room_number)
            .input("room_type", sql.VarChar, room_type)
            .input("price", sql.Decimal(10, 2), price)
            .input("description", sql.Text, description)
            .input("image", sql.Text, image)
            .input("status", sql.VarChar, status)
            .query(`
                INSERT INTO Rooms (room_number, room_type, price, description, Image, status)
                VALUES (@room_number, @room_type, @price, @description, @image, @status)
            `);

        res.status(201).json({ message: "Room added successfully" });
    } catch (err) {
        console.error("Error adding room:", err);
        res.status(500).json({ message: err.message });
    }
});


//if the admin want only a specific rooms details
rooms.get('/:id', verifytoken, verifyrole("admin"), async (req, res) => {
    const roomId = req.params.id;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("room_id", sql.Int, roomId)
            .query("SELECT * FROM Rooms WHERE room_id = @room_id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error("Error fetching room:", err);
        res.status(500).json({ message: err.message });
    }
});


//if admin wants to update the rooms
rooms.put('/:id', verifytoken, verifyrole("admin"), async (req, res) => {
    const roomId = req.params.id;
    const { room_number, room_type, price, description, image, status } = req.body;

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("room_id", sql.Int, roomId)
            .input("room_number", sql.VarChar, room_number)
            .input("room_type", sql.VarChar, room_type)
            .input("price", sql.Decimal(10, 2), price)
            .input("description", sql.Text, description)
            .input("image", sql.Text, image)
            .input("status", sql.VarChar, status)
            .query(`
                UPDATE Rooms SET 
                    room_number = @room_number,
                    room_type = @room_type,
                    price = @price,
                    description = @description,
                    Image = @image,
                    status = @status
                WHERE room_id = @room_id
            `);

        res.status(200).json({ message: "Room updated successfully" });
    } catch (err) {
        console.error("Error updating room:", err);
        res.status(500).json({ message: err.message });
    }
});


//if admin wants to delete any room
rooms.delete('/:id', verifytoken, verifyrole("admin"), async (req, res) => {
    const roomId = req.params.id;

    try {
        const pool = await poolPromise;

        // Pehle check karo room exist karta hai ya nahi
        const check = await pool.request()
            .input("room_id", sql.Int, roomId)
            .query("SELECT * FROM Rooms WHERE room_id = @room_id");

        if (check.recordset.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Room delete karo
        await pool.request()
            .input("room_id", sql.Int, roomId)
            .query("DELETE FROM Rooms WHERE room_id = @room_id");

        res.status(200).json({ message: "Room deleted successfully" });
    } catch (err) {
        console.error("Error deleting room:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports=rooms;