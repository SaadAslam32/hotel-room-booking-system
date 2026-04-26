# Hotel Room Booking System

## 📌 Overview

This project is a **Hotel Room Booking System** built using **Node.js**, **Express.js**, **SQL Database**, and a modern **JavaScript frontend**.
It allows users to book rooms, manage payments, and view reports, while admins can manage rooms and bookings.

---

## 🛠️ Tech Stack

**Backend**

* Node.js
* Express.js
* SQL Database
* dotenv

**Frontend**

* HTML
* CSS
* JavaScript

---

## 📁 Project Structure

```
HOTELROOMBOOKING
│
├── BackendProject
│   ├── config/
│   ├── Routes/
│   │   ├── bookings.js
│   │   ├── dashboard.js
│   │   ├── login.js
│   │   ├── payments.js
│   │   ├── reports.js
│   │   ├── rooms.js
│   │   ├── signup.js
│   ├── .env
│   ├── server.js
│
├── frontendproject/hotel-frontend
│   ├── public/
│   ├── src/
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Install Backend

```
cd BackendProject
npm install
node server.js
```

---

### 2️⃣ Install Frontend

```
cd frontendproject/hotel-frontend
npm install
npm start
```

---

## 🗄️ Database

This project uses an **SQL database** to manage:

* Users
* Rooms
* Bookings
* Payments

Create a database and update database credentials inside:

```
BackendProject/.env
```

Example:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hotel_booking_db
```

---

## ✨ Features

* User Signup & Login
* Room Management
* Room Booking
* Payment Handling
* Dashboard
* Reports Generation

---

## 👨‍💻 Author

Muhammad Saad Aslam
