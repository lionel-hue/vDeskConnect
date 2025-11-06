# vDeskConnect

A virtual learning platform connecting teachers and students, enabling virtual classes, progress tracking, analytics, and school‑specific customization.

## ✅ Overview

vDeskConnect serves as the base system for building customized school learning portals. Schools can fork this base application and adapt:
- 🎨 UI themes
- 🔐 Access roles
- ⚙️ Workflow requirements
- 📊 Database rules

---

## ✅ Live Deployment

**Frontend (Vercel):**  
https://vdeskconnect.vercel.app/

---

## ✅ Features

### 👨‍🏫 Teacher Tools

- Create/manage classes
- Upload course materials
- Review student submissions
- Track student progress

### 👩‍🎓 Student Tools

- Attend virtual classes
- Access learning resources
- Submit assignments
- View performance statistics

### 📊 Admin Features

- Manage teachers & students
- Monitor platform usage
- Data‑driven insights

---

## ✅ Tech Stack

| Layer        | Technology          |
|--------------|---------------------|
| Frontend     | React (Vite)        |
| Backend      | Node.js, Express    |
| Database     | MySQL               |
| ORM (Planned)| Prisma              |
| Auth         | JWT                 |
| Deployment   | Vercel / Render     |
| Styling      | Custom CSS          |

---

## ✅ How to Install Locally

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/vDeskConnect.git
cd vDeskConnect
```

2. Install frontend dependencies

```bash
cd frontend
npm install
```

3. Install backend dependencies

```bash
cd ../backend
npm install
```

4. Configure environment variables

Create a .env file in the backend folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=vdeskconnect
JWT_SECRET=your_secret
```

5. Start backend

```bash
npm run dev
```

6. Start frontend

```bash
cd ../frontend
npm run dev
```

---

✅ Frontend File Structure (React)

```
vDeskConnect-frontend/
├── public/
│   ├── index.html        # Main HTML entry file
│   └── assets/           # Images, icons, static files
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Navbar/       # Top navigation bar component
│   │   ├── Sidebar/      # Dashboard sidebar navigation
│   │   └── Cards/        # UI cards used in dashboards
│   ├── pages/            # All frontend pages
│   │   ├── Login/        # Login screen & logic
│   │   ├── Dashboard/    # Main dashboard page
│   │   ├── Students/     # Student dashboard & modules
│   │   ├── Teachers/     # Teacher dashboard & modules
│   │   └── Courses/      # Course listing and details
│   ├── context/          # Global React context providers
│   ├── hooks/            # Custom reusable React hooks
│   ├── utils/            # Helper functions & constants
│   ├── services/         # Handles API communication
│   │   ├── auth.service.js
│   │   ├── student.service.js
│   │   └── teacher.service.js
│   ├── App.jsx           # App root component
│   └── main.jsx          # React entry point
├── package.json
└── vite.config.js
```

---

✅ Backend File Structure (Node.js + Express)

```
vDeskConnect-backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MySQL database connection
│   │   └── jwt.js             # JWT config & helper functions
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── controllers/
│   │   ├── auth.controller.js # Login & registration logic
│   │   ├── student.controller.js
│   │   ├── teacher.controller.js
│   │   └── course.controller.js
│   ├── routes/
│   │   ├── auth.routes.js     # Auth endpoints
│   │   ├── student.routes.js  # Student management endpoints
│   │   ├── teacher.routes.js  # Teacher management endpoints
│   │   └── course.routes.js   # Course endpoints
│   ├── models/
│   │   ├── users.sql          # User table schema
│   │   ├── courses.sql        # Course table schema
│   │   └── progress.sql       # Student progress schema
│   ├── utils/                 # Utility helpers
│   └── server.js              # App entry point
├── package.json
└── .env
```

---

✅ Test Accounts

Admin

```text
email: admin@vdesk.com
password: AdminPass123
```

Teacher

```text
email: teacher1@vdesk.com
password: TeachPass123
```

Student

```text
email: student1@vdesk.com
password: StudPass123
```

---

✅ Known Issues

1. Account Creation Fails With Poor Network

· Ensure a stable internet connection
· Avoid disconnecting during registration

2. JWT Errors

· Confirm JWT secret
· Confirm expiration time

---

✅ Future Plans

· Full Prisma migration
· CI/CD for multi-school versions
· Automated testing (Jest + SuperTest)
· Plugin system for school modules
