# 💬 Chat Application (MERN + Socket.io)

A real-time chat application built using **Node.js, Express, MongoDB, React, and Socket.io**.

---

## 🚀 Features

- 🔐 User Authentication (JWT)
- 💬 Real-time Messaging (Socket.io)
- 📡 REST APIs (Express)
- 🗄️ MongoDB Database (Mongoose)
- 📁 File Upload (Multer)
- 🎯 Redux Toolkit (State Management)
- 🎨 Responsive UI (Bootstrap + React)

---

## 🏗️ Tech Stack

### Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io
- JWT Authentication

### Frontend:
- React.js
- Redux Toolkit
- React Router
- Bootstrap
- Socket.io Client

---

## 📂 Project Structure

chat-app/
│
├── backend/
│   ├── index.mjs
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── config/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── redux/
│   └── pages/
│
└── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

git clone https://github.com/your-username/chat-app.git
cd chat-app

---

### 2️⃣ Backend Setup

cd backend
npm install

Create `.env` file:

PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key

Run backend:

npm start

---

### 3️⃣ Frontend Setup

cd frontend
npm install
npm start

---

## 🔌 API Endpoints (Example)

| Method | Endpoint       | Description       |
|--------|--------------|------------------|
| POST   | /api/login    | User Login       |
| POST   | /api/register | Register User    |
| GET    | /api/messages | Get Messages     |

---

## 📡 Socket Events

- connection
- sendMessage
- receiveMessage
- disconnect

---

## 🧪 Scripts

### Backend:
npm start

### Frontend:
npm start
npm run build

---

## 👨‍💻 Author

**Yogesh Saini**
- GitHub: https://github.com/yogesh717
