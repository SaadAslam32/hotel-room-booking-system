const express = require('express');
const { sql, poolPromise } = require("../config/db.js");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");

require('dotenv').config();
const secretkey = process.env.secretkey;

const login = express.Router();

login.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await poolPromise;

        const emailcheck = await pool.request()
            .input("email", sql.VarChar, email)
            .query("SELECT * FROM Users WHERE email = @email");

        if (emailcheck.recordset.length === 0) {
            return res.status(404).send("No email exists, enter a valid email.\n");
        }

        const validPassword = await bcrypt.compare(password, emailcheck.recordset[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { email: emailcheck.recordset[0].email, role: emailcheck.recordset[0].role },
            secretkey,
            { expiresIn: "10h" }
        );

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = login;
