const express = require("express");
const { sql, poolPromise } = require("./config/db");
const app = express();
const signup=require("./Routes/signup");
const login=require("./Routes/login");
const dashboard=require("./Routes/dashboard");
const rooms=require("./Routes/rooms");
const bookings=require("./Routes/bookings");
const payments=require("./Routes/payments");
const reports=require("./Routes/reports");
const cors = require("cors");
require('dotenv').config();
const PORT = process.env.PORT; // fallback port
app.use(cors());
// Middleware (optional but useful)
app.use(express.json());
app.use("/signup",signup);
app.use("/login",login);
app.use("/dashboard",dashboard);
app.use("/rooms",rooms);
app.use("/bookings",bookings);
app.use("/payments",payments);
app.use("/reports",reports);

// Start server
poolPromise
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to start server:", err);
    });

