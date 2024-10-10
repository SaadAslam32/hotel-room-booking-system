// db.js - Microsoft SQL Server (MSSQL) Connection File

const sql = require("mssql");
require("dotenv").config();
const dHost=process.env.dbhost;
const dport = parseInt(process.env.dbport);
const dpassword=process.env.dbpassword;
const duser=process.env.dbuser;
const dname=process.env.dbname;
// Azure MSSQL Database Configuration
const config = {
    user: duser,  // Replace with your actual MSSQL username
    password: dpassword,  // Replace with your actual password
    server: dHost,
    port:dport,  // Change if your database is on a remote server
    database: dname,  // Your database name
    options: {
        encrypt: false,  // Set true for Azure, false for local
        trustServerCertificate: true  // Required for self-signed SSL certificates
    }
};



async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log("Connected to MSSQL");
        return pool;
    } catch (err) {
        console.error("Database Connection Failed! Error:", err);
        process.exit(1); // Exit the process if connection fails
    }
}

const poolPromise = connectToDatabase(); //async function returns promise


module.exports = {
    sql, 
    poolPromise
};
