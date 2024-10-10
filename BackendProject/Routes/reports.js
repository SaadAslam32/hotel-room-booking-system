const express = require('express');
const { sql, poolPromise } = require('../config/db');
const { verifytoken, verifyrole } = require('../config/middleware');

const reports = express.Router();

//cutomer create a report
reports.post('/create', verifytoken, verifyrole("customer"), async (req, res) => {
    const { booking_id, message } = req.body;
    const email = req.user.email;

    if (!message) {
        return res.status(400).json({ message: "Report message is required." });
    }

    try {
        const pool = await poolPromise;

        // Get user_id from email
        const userResult = await pool.request()
            .input("email", sql.VarChar, email)
            .query("SELECT user_id FROM Users WHERE email = @email");

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const user_id = userResult.recordset[0].user_id;

        // Insert report
        const request = pool.request()
            .input("user_id", sql.Int, user_id)
            .input("message", sql.Text, message);

        if (booking_id) {
            request.input("booking_id", sql.Int, booking_id);
        } else {
            request.input("booking_id", sql.Int, null);
        }

        await request.query(`
            INSERT INTO Reports (user_id, booking_id, message)
            VALUES (@user_id, @booking_id, @message)
        `);

        res.status(201).json({ message: "Report submitted successfully." });
    } catch (err) {
        console.error("Create Report Error:", err);
        res.status(500).json({ message: "Internal Server Error." });
    }
});

// 2️⃣ Admin views all reports
reports.get('/all', verifytoken, verifyrole("admin"), async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT 
                R.report_id,
                R.message,
                R.status,
                R.created_at,
                U.name AS customer_name,
                U.email AS customer_email,
                B.booking_id,
                B.check_in,
                B.check_out
            FROM Reports R
            JOIN Users U ON R.user_id = U.user_id
            LEFT JOIN Bookings B ON R.booking_id = B.booking_id
            ORDER BY R.created_at DESC
        `);

        res.status(200).json({ reports: result.recordset });
    } catch (err) {
        console.error("Get Reports Error:", err);
        res.status(500).json({ message: "Internal Server Error." });
    }
});

// 3️⃣ Admin updates status (resolved/ignored)
reports.put('/status/:id', verifytoken, verifyrole("admin"), async (req, res) => {
    const report_id = req.params.id;
    const { status } = req.body;

    if (!['pending', 'resolved', 'ignored'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("report_id", sql.Int, report_id)
            .input("status", sql.VarChar, status)
            .query(`
                UPDATE Reports SET status = @status WHERE report_id = @report_id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Report not found." });
        }

        res.status(200).json({ message: "Report status updated." });
    } catch (err) {
        console.error("Update Report Status Error:", err);
        res.status(500).json({ message: "Internal Server Error." });
    }
});

module.exports = reports;
