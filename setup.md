# 🚀 Project Management Hub

A comprehensive, full-stack Project Management System designed to help teams collaborate effectively. This application allows users to create workspaces, invite team members, manage active projects, assign tasks, collaborate through real-time discussions, and attach files.

## ✨ Features

### 🏢 Workspace Management
- **Create & Switch Workspaces:** Users can own or join multiple workspaces.
- **Role-Based Access Control:** Differentiate between Admins and standard Members.
- **Email Invitations:** Secure, JWT-based email invitation system built with Nodemailer to easily add members to a workspace.

### 📊 Project & Task Tracking
- **Project Overviews:** Create projects, set deadlines, and track progression.
- **Task Management:** Create detailed tasks, assign members, set priorities (Low, Medium, High) and statuses (To-Do, In Progress, Completed).
- **File Uploads:** Attach images and files directly to tasks.
- **Task Discussions:** Real-time commenting system using WebSockets.

### 🔔 Real-time & Automation
- **Live Updates:** Integrated with Socket.io for immediate updates without relying on page refreshes.
- **Automated Cron Jobs:** Backend cron jobs execute daily checks, such as querying for overdue tasks.

### 🎨 UI & UX
- **Modern Interface:** Built with React and styled beautifully with Tailwind CSS.
- **Dark Mode Support:** Built-in seamless dark and light modes.
- **Responsive Design:** Completely optimized for both desktop and mobile platforms.

---

## 🛠️ Technology Stack

### **Frontend** (Vite + React)
- **Framework:** React.js (via Vite)
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit (`authSlice`, `workspaceSlice`, `themeSlice`)
- **Routing:** React Router DOM
- **Icons & UI:** `lucide-react`, `react-hot-toast`
- **Network Requests:** Axios
- **Websockets:** `socket.io-client`

### **Backend** (Node.js + Express)
- **Environment:** Node.js, Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **Real-time Engine:** Socket.io
- **File Parsing & Uploads:** Multer
- **Email Messaging:** Nodemailer
- **Automation:** Node-cron

### **Hosting / Deployments**
- **Frontend App:** Vercel (with SPA routing configuration via `vercel.json`)
- **Backend API:** Render
- **Database Host:** MongoDB Atlas

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js
- MongoDB account (Atlas or local instance)

### 1. Clone the Repository
```bash
git clone <repository_url>
cd project-management
```

### 2. Backend Setup
Navigate into the backend directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and configure the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal tab and navigate into the frontend directory:
```bash
cd project-management
npm install
```

*(Optional: Configure backend endpoints inside `/src/api/index.js` and `/src/socket.js` as needed)*

Start the frontend development server:
```bash
npm run dev
```

---

## 🌍 Production Notes
- **CORS Configuration:** The backend accepts dynamic requests (`credentials: true`), avoiding CORS blocks across staging and production hosts.
- **Vercel Routing Fallback:** The frontend enforces a `vercel.json` strategy (`(.*) -> /index.html`) to prevent `404 NOT_FOUND` errors on direct URL navigation.
