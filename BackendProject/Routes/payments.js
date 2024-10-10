const express = require('express');
const { sql, poolPromise } = require("../config/db.js");
const { verifytoken, verifyrole } = require('../config/middleware.js');
require('dotenv').config();

const payments = express.Router();


//user when get the approval of booking from the admin he will get the option of proceed payment when he clicks on the procced payments then the following route will runs in the backgroud
//it will give the full details of bookings like price, nights and total prices 
payments.get('/get-details/:booking_id', verifytoken, verifyrole("customer"), async (req, res) => {
    const booking_id = req.params.booking_id;
    const email = req.user.email;

    try {
        const pool = await poolPromise;

        // Get user
        const userResult = await pool.request()
            .input("email", sql.VarChar, email)
            .query("SELECT user_id FROM Users WHERE email = @email");

        const user_id = userResult.recordset[0].user_id;

        // Get booking
        const bookingResult = await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query("SELECT * FROM Bookings WHERE booking_id = @booking_id");

        if (bookingResult.recordset.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = bookingResult.recordset[0];

        if (booking.user_id !== user_id) {
            return res.status(403).json({ message: "Unauthorized access to this booking" });
        }

        if (booking.status !== "confirmed") {
            return res.status(400).json({ message: "Booking is not confirmed yet" });
        }

        // Get room price
        const roomResult = await pool.request()
            .input("room_id", sql.Int, booking.room_id)
            .query("SELECT room_number, price FROM Rooms WHERE room_id = @room_id");

        const price = roomResult.recordset[0].price;
        const room_number = roomResult.recordset[0].room_number;

        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const diffTime = Math.abs(checkOut - checkIn);
        let nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if(nights===0)
        {
            nights+=1;
        }
        const totalAmount = price * nights;

        return res.status(200).json({
            room_number,
            check_in: booking.check_in,
            check_out: booking.check_out,
            nights,
            price_per_night: price,
            total_amount: totalAmount
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


//now user has got the details of how much he has to pay 

payments.post('/pay/:id', verifytoken, verifyrole("customer"), async (req, res) => {
    const { method, amount } = req.body;
    const email=req.user.email;
const booking_id = parseInt(req.params.id);
if (isNaN(booking_id)) {
    return res.status(400).json({ message: "Invalid booking ID." });
}
    if (!booking_id || !method || !amount) {
        return res.status(400).json({ message: "Booking ID, amount, and payment method are required." });
    }

    try {
        const pool = await poolPromise;

        // Get user_id from email
        const userResult = await pool.request()
            .input("email", sql.VarChar, email)
            .query("SELECT user_id FROM Users WHERE email = @email");

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user_id = userResult.recordset[0].user_id;

        // Get booking
        const bookingResult = await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query("SELECT * FROM Bookings WHERE booking_id = @booking_id");

        if (bookingResult.recordset.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = bookingResult.recordset[0];

        if (booking.user_id !== user_id) {
            return res.status(403).json({ message: "This booking doesn't belong to you." });
        }

        if (booking.status !== "confirmed") {
            return res.status(400).json({ message: "Only confirmed bookings can be paid for." });
        }

        if (booking.payment_status === "paid") {
            return res.status(400).json({ message: "This booking is already paid." });
        }

        // Get Room price
        const roomResult = await pool.request()
            .input("room_id", sql.Int, booking.room_id)
            .query("SELECT price FROM Rooms WHERE room_id = @room_id");

        if (roomResult.recordset.length === 0) {
            return res.status(404).json({ message: "Room not found for this booking." });
        }

        const price = parseFloat(roomResult.recordset[0].price);

        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const diffTime = Math.abs(checkOut - checkIn);
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const totalAmount = price * nights;

        // Compare paid amount with calculated amount
        const paidAmount = parseFloat(amount);

        if (paidAmount < totalAmount) {
            return res.status(400).json({ 
                message: `Insufficient payment. You need to pay full amount of PKR ${totalAmount}` 
            });
        }

        // Insert into Payments
        await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .input("amount", sql.Decimal(10, 2), paidAmount)
            .input("method", sql.VarChar, method)
            .query(`
                INSERT INTO Payments (booking_id, amount, method)
                VALUES (@booking_id, @amount, @method)
            `);

        // Update Booking
        await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query(`
                UPDATE Bookings SET payment_status = 'paid' WHERE booking_id = @booking_id
            `);

        res.status(200).json({ 
            message: "Payment successful", 
            amountCharged: paidAmount, 
            nights 
        });

    } catch (err) {
        console.error("Payment Error:", err);
        res.status(500).json({ message: err.message });
    }
});



//now admin wants all the payments summary
payments.get('/all', verifytoken, verifyrole("admin"), async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
     SELECT 
    P.payment_id,
    P.amount,
    P.method,
    P.paid_at,
    B.booking_id,
    B.check_in,
    B.check_out,
    B.status AS booking_status,
    B.payment_status,
    R.room_id,
    R.room_number,
    U.user_id,
    U.name AS customer_name,
    U.email AS customer_email
FROM Payments P
JOIN Bookings B ON P.booking_id = B.booking_id
JOIN Rooms R ON B.room_id = R.room_id
JOIN Users U ON B.user_id = U.user_id
ORDER BY P.paid_at DESC

        `);

        res.status(200).json({ message: "All payments fetched", payments: result.recordset });

    } catch (err) {
        console.error("Admin Payments Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

//if admin wants only a specific payment


payments.get('/get/:id', verifytoken, verifyrole("admin"), async (req, res) => {
    try {
        const pool = await poolPromise;
        const booking_id = req.params.id;

        const result = await pool.request()
            .input("booking_id", sql.Int, booking_id)
            .query(`
                SELECT 
                    P.payment_id,
                    P.amount,
                    P.method,
                    P.paid_at,
                    B.booking_id,
                    B.check_in,
                    B.check_out,
                    B.status AS booking_status,
                    B.payment_status,
                    R.room_id,
                    
                    U.user_id,
                    U.name AS customer_name,
                    U.email AS customer_email
                FROM Payments P
                JOIN Bookings B ON P.booking_id = B.booking_id
                JOIN Rooms R ON B.room_id = R.room_id
                JOIN Users U ON B.user_id = U.user_id
                WHERE B.booking_id = @booking_id
                ORDER BY P.Paid_at DESC
            `);
        if(result.recordset.length==0)
        {
            res.status(404).json({message:"payment not found for this booking\n"});
        }
        res.status(200).json({ payment: result.recordset });

    } catch (err) {
        console.error("Admin Payment Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


//customer payment history ,if customer wants to get his payments history of how much he has paid
payments.get('/my', verifytoken, verifyrole("customer"), async (req, res) => {
    const email = req.user.email;

    try {
        const pool = await poolPromise;

        // Get user_id from email
        const userResult = await pool.request()
            .input("email", sql.VarChar, email)
            .query("SELECT user_id FROM Users WHERE email = @email");

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user_id = userResult.recordset[0].user_id;

        // Get all payments for that user
        const result = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT 
                    P.payment_id,
                    P.amount,
                    P.method,
                    P.paid_at,
                    B.booking_id,
                    B.check_in,
                    B.check_out,
                    R.room_id
                    
                FROM Payments P
                JOIN Bookings B ON P.booking_id = B.booking_id
                JOIN Rooms R ON B.room_id = R.room_id
                WHERE B.user_id = @user_id
                ORDER BY P.paid_at DESC
            `);

        res.status(200).json({ payments: result.recordset });

    } catch (err) {
        console.error("Customer Payment History Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports=payments;