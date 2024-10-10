const express = require('express');
const { sql, poolPromise } = require("../config/db.js");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");

require('dotenv').config();
const secretkey = process.env.secretkey;

const signup = express.Router();

signup.post('/', async (req, res) => {
    const pool = await poolPromise;
    const { name, email, password,  phonenumber } = req.body;

    try {
        console.log("request recieved\n");
        const checkUser = await pool.request()
            .input("email", sql.VarChar, email)
            .query("SELECT email FROM Users WHERE email = @email");

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.request()
            .input("name", sql.VarChar, name)
            .input("email", sql.VarChar, email)
            .input("password", sql.VarChar, hashedPassword)
            
            .input("phone_number", sql.VarChar, phonenumber)
            .query("INSERT INTO Users (name, email, password, role, phone_number) VALUES (@name, @email, @password, 'customer', @phone_number)");

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("signupfaailed\n");
    }
});

module.exports = signup;
