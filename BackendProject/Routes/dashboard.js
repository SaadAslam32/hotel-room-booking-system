const express = require('express');
const dashboard = express.Router();
const { sql, poolPromise } = require('../config/db.js');
const {verifytoken,verifyrole} = require('../config/middleware.js');

dashboard.get('/', verifytoken, async (req, res) => {
    try {
        const email = req.user.email;
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input('email', sql.VarChar, email)
            .query("SELECT * FROM Users WHERE email = @email");

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error("Error in dashboard:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = dashboard;
