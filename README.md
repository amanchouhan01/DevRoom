# 🤖 AI Agent — Collaborative Coding Environment

A real-time AI-powered collaborative coding platform where developers can chat, write code, and run it live in the browser — all in one place.

---

## 🚀 Features

- **AI-Powered Chat** — Tag `@ai` in chat to generate code, files, and project structures using Google Gemini
- **Real-time Collaboration** — Multiple users can work on the same project simultaneously via Socket.io
- **In-Browser Code Execution** — Run Node.js projects directly in the browser using WebContainers (no server needed)
- **Live File Editor** — Syntax-highlighted, editable code editor with file tree navigation
- **Persistent Chat History** — All messages stored in MongoDB, visible to every collaborator on join
- **Project Management** — Create projects, invite collaborators, manage team members
- **JWT Authentication** — Secure login/register with token blacklisting via Redis on logout
- **Auto-save** — File tree changes are saved to the database on blur

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React.js | UI framework |
| Tailwind CSS | Styling |
| Socket.io Client | Real-time messaging |
| WebContainers API | In-browser Node.js runtime |
| highlight.js | Syntax highlighting |
| markdown-to-jsx | Rendering AI markdown responses |
| Axios | HTTP requests |
| React Router v6 | Client-side routing |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time bidirectional communication |
| Google Gemini AI | AI code generation |
| JWT | Authentication |
| Redis | Token blacklisting on logout |
| bcrypt | Password hashing |
| express-validator | Input validation |

---

## 📁 Project Structure

```
ai_agent/
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── Home.jsx          # Project dashboard
│   │   │   ├── Project.jsx       # Main coding environment
│   │   │   ├── Login.jsx         # Login page
│   │   │   └── Register.jsx      # Register page
│   │   ├── components/
│   │   │   └── Navbar.jsx        # Global navigation bar
│   │   ├── context/
│   │   │   └── user.context.jsx  # Global user state
│   │   ├── config/
│   │   │   ├── axios.js          # Axios instance with auth interceptor
│   │   │   ├── socket.js         # Socket.io client config
│   │   │   └── webContainer.js   # WebContainer initialization
│   │   ├── auth/
│   │   │   └── UserAuth.jsx      # Protected route wrapper
│   │   └── routes/
│   │       └── AppRoutes.jsx     # App routing
│   └── index.html
│
└── backend/
    ├── models/
    │   ├── user.model.js         # User schema (name, email, password)
    │   └── project.model.js      # Project schema (users, fileTree, messages)
    ├── controllers/
    │   ├── user.controller.js
    │   └── project.controller.js
    ├── services/
    │   ├── user.service.js
    │   ├── project.service.js
    │   ├── ai.service.js         # Gemini AI integration
    │   └── redis.service.js
    ├── middleware/
    │   └── auth.middleware.js    # JWT verification
    ├── routes/
    │   ├── user.router.js
    │   └── project.router.js
    └── server.js                 # Socket.io + Express server
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/amanchouhan01/ai_agent
cd ai-agent
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
REDIS_URL=your_redis_url
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

### 4. Open in browser

```
http://localhost:5173
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 8080) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `REDIS_URL` | Redis connection URL |
| `GEMINI_API_KEY` | Google Gemini API key |
| `VITE_API_URL` | Backend URL for frontend (Vite env) |

---

## 💬 How to Use

1. **Register/Login** — Create an account with your name, email, and password
2. **Create a Project** — Click "New Project" on the dashboard
3. **Invite Collaborators** — Use "Add Collaborator" inside the project
4. **Chat with AI** — Type `@ai create an express server` to generate code
5. **Edit Files** — Click any file in the file tree to open and edit it
6. **Run Code** — Click the **Run** button to install dependencies and start the server live in your browser

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

[MIT](LICENSE)

---

## 👨‍💻 Author

**Aman Chouhan**  
B.Tech ECE — Jawaharlal Nehru University, New Delhi  
[GitHub](https://github.com/amanchouhan01) • [LinkedIn](https://linkedin.com/in/aman-chouhan-sde) • [Portfolio](https://aman-chouhan.onrender.com)