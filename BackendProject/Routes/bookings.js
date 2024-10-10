// routes/bookings.js
const express = require('express');
const { sql, poolPromise } = require("../config/db.js");
const { verifytoken, verifyrole } = require('../config/middleware.js');
require('dotenv').config();
const cron = require('node-cron');
const bookings = express.Router();

// Route to create a new booking (Customer only)
bookings.post('/create', verifytoken, verifyrole("customer"), async (req, res) => {
    const { room_id, check_in, check_out } = req.body;
    const email = req.user.email;

    try {
        const pool = await poolPromise;

        console.log("booking is trying\n");
        // Check room availability
        const room_availability = await pool.request()
            .input("room_id", sql.Int, room_id)
            .query("SELECT * FROM Rooms WHERE room_id = @room_id");

        if (room_availability.recordset.length === 0) {
            return res.status(404).json({ message: "Room ID not found" });
        }

        if (room_availability.recordset[0].status === 'booked') {
            return res.status(401).json({ message: "Room is already booked" });
        }

        // Get user ID from email
        const userResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query("SELECT user_id FROM Users WHERE email = @email");

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user_id = userResult.recordset[0].user_id;

        // Insert booking
        await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("room_id", sql.Int, room_id)
            .input("check_in", sql.Date, check_in)
            .input("check_out", sql.Date, check_out)
            .query(`
                INSERT INTO Bookings (user_id, room_id, check_in, check_out)
                VALUES (@user_id, @room_id, @check_in, @check_out)
            `);

        res.status(201).json({ message: "Booking created successfully" });
    } catch (err) {
        console.error("Booking error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Route for customer to view their own bookings
bookings.get('/mybookings', verifytoken, verifyrole("customer"), async (req, res) => {
    const email = req.user.email;

    try {
        const pool = await poolPromise;
        const userResult = await pool.request()
            .input("email", sql.VarChar, email)
            .query("SELECT user_id FROM Users WHERE email = @email");

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user_id = userResult.recordset[0].user_id;

        const bookingResult = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query("SELECT * FROM Bookings WHERE user_id = @user_id");

        res.status(200).json(bookingResult.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route for admin to view all bookings
bookings.get('/all', verifytoken, verifyrole("admin"), async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT B.*, U.name as customer_name, R.room_number, R.room_type 
            FROM Bookings B
            JOIN Users U ON B.user_id = U.user_id
            JOIN Rooms R ON B.room_id = R.room_id
            ORDER BY B.created_at DESC
        `);

        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin view pending bookings
bookings.get('/allPendings', verifytoken, verifyrole("admin"), async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT B.*, U.name as customer_name, R.room_number, R.room_type 
            FROM Bookings B
            JOIN Users U ON B.user_id = U.user_id
            JOIN Rooms R ON B.room_id = R.room_id
            WHERE B.status = 'pending'
            ORDER BY B.created_at DESC
        `);

        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin approves booking and updates room status
bookings.put('/:id/approve', verifytoken, verifyrole("admin"), async (req, res) => {
    const booking_id = req.params.id;

    try {
        const pool = await poolPromise;

        const roomResult = await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query("SELECT * FROM Bookings WHERE booking_id = @booking_id");

        if (roomResult.recordset.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const room_id = roomResult.recordset[0].room_id;

        await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query("UPDATE Bookings SET status = 'confirmed' WHERE booking_id = @booking_id");

        await pool.request()
            .input("room_id", sql.Int, room_id)
            .query("UPDATE Rooms SET status = 'booked' WHERE room_id = @room_id");

        res.status(200).json({ message: "Booking approved" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin cancels a booking and updates room status
bookings.put('/:id/cancel', verifytoken, verifyrole("admin"), async (req, res) => {
    const booking_id = req.params.id;

    try {
        const pool = await poolPromise;

        const roomResult = await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query("SELECT * FROM Bookings WHERE booking_id = @booking_id");

        if (roomResult.recordset.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const room_id = roomResult.recordset[0].room_id;

        await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query("UPDATE Bookings SET status = 'canceled' WHERE booking_id = @booking_id");

        await pool.request()
            .input("room_id", sql.Int, room_id)
            .query("UPDATE Rooms SET status = 'available' WHERE room_id = @room_id");

        res.status(200).json({ message: "Booking canceled" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin deletes a canceled booking
bookings.delete('/:id/delete', verifytoken, verifyrole("admin"), async (req, res) => {
    const booking_id = req.params.id;

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query("SELECT * FROM Bookings WHERE booking_id = @booking_id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (result.recordset[0].status !== 'canceled') {
            return res.status(401).json({ message: "Only canceled bookings can be deleted" });
        }

        await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query("DELETE FROM Bookings WHERE booking_id = @booking_id");

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Customer can change booking dates before confirmation
bookings.put('/:id/update', verifytoken, verifyrole("customer"), async (req, res) => {
    const booking_id = req.params.id;
    const { check_in, check_out } = req.body;
    const email = req.user.email;
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    try {
        const pool = await poolPromise;

        // Validate dates
        if (new Date(check_in) < new Date(currentDate)) {
            return res.status(400).json({ message: "Check-in date cannot be in the past" });
        }

        if (new Date(check_out) <= new Date(check_in)) {
            return res.status(400).json({ message: "Check-out date must be after check-in date" });
        }

        // Get user ID
        const user = await pool.request()
            .input("email", sql.VarChar, email)
            .query("SELECT user_id FROM Users WHERE email = @email");

        if (user.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const user_id = user.recordset[0].user_id;

        // Get booking details
        const booking = await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query("SELECT * FROM Bookings WHERE booking_id = @booking_id");

        if (booking.recordset.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.recordset[0].user_id !== user_id) {
            return res.status(403).json({ message: "Unauthorized to modify this booking" });
        }

        if (booking.recordset[0].status !== 'pending') {
            return res.status(400).json({ message: "Only pending bookings can be modified" });
        }

        // Update booking
        await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .input("check_in", sql.Date, check_in)
            .input("check_out", sql.Date, check_out)
            .query(`
                UPDATE Bookings
                SET check_in = @check_in, check_out = @check_out
                WHERE booking_id = @booking_id
            `);

        res.status(200).json({ message: "Booking updated successfully" });
    } catch (err) {
        console.error("Booking update error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Function to clean up expired bookings and update room statuses
async function cleanupExpiredBookings() {
    try {
        const pool = await poolPromise;
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        // Get all bookings that have check_out date before today and status is 'confirmed'
        const expiredBookings = await pool.request()
            .query(`SELECT booking_id, room_id FROM Bookings 
                   WHERE check_out < '${today}' AND status = 'confirmed'`);

        if (expiredBookings.recordset.length > 0) {
            console.log(`Found ${expiredBookings.recordset.length} expired bookings to cleanup`);

            // Update each booking status to 'completed'
            for (const booking of expiredBookings.recordset) {
                await pool.request()
                    .input("booking_id", sql.Int, booking.booking_id)
                    .query("UPDATE Bookings SET status = 'completed' WHERE booking_id = @booking_id");

                // Update corresponding room status to 'available'
                await pool.request()
                    .input("room_id", sql.Int, booking.room_id)
                    .query("UPDATE Rooms SET status = 'available' WHERE room_id = @room_id");
            }

            console.log(`Successfully cleaned up ${expiredBookings.recordset.length} expired bookings`);
        }
    } catch (err) {
        console.error("Error in cleanupExpiredBookings:", err);
    }
}

// Schedule the cleanup to run daily at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running daily booking cleanup...');
    cleanupExpiredBookings();
});

module.exports = bookings;