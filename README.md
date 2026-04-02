# ResolveX - Where Every Concern Finds a Resolution

A campus complaint and maintenance management system that allows students to submit complaints digitally, track resolution status, and enables administrators to manage, prioritize, and resolve issues efficiently.

## Features

- **Role-based Authentication**: Student, Staff, Admin with JWT + bcrypt
- **Complaint Submission**: Title, description, category, location, priority, optional image
- **NLP Classification**: Auto-detect category and urgency using keyword-based NLP
- **Smart Auto-Assignment**: Assign complaints to staff by department and workload
- **SLA Escalation**: Auto-escalate complaints that exceed time limits
- **Real-time Notifications**: Status change, assignment, escalation alerts
- **Analytics Dashboard**: Trends, category/priority charts, department performance, predictive insights

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, React Router
- **Backend**: Node.js, Express.js
- **Database**: MySQL (Sequelize ORM)
- **Auth**: JWT, bcrypt
- **NLP**: Natural.js (keyword-based classification)

## Project Structure

```
resolvex/
├── backend/
│   ├── config/         # DB, SLA config
│   ├── models/         # User, Complaint, Notification
│   ├── routes/         # auth, complaints, notifications, analytics, users
│   ├── middleware/     # auth, authorize
│   ├── services/       # NLP, auto-assignment, notifications
│   ├── jobs/           # SLA escalation
│   ├── seeds/          # Sample data
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── ...
└── README.md
```

## Prerequisites

- Node.js 18+
- MySQL 5.7+ or MariaDB

## Setup & Run

### 1. Create MySQL Database

```sql
CREATE DATABASE resolvex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd resolvex/backend
npm install
cp .env.example .env
# Edit .env: set DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm run dev
```

Backend runs on `http://localhost:5000`. Sequelize will auto-create tables on first run.

### 3. Seed Database (optional)

```bash
cd resolvex/backend
npm run seed
```

Sample credentials:
- **Admin**: admin@resolvex.edu / admin123
- **Staff (Electrical)**: staff.electrical@resolvex.edu / staff123
- **Staff (Plumbing)**: staff.plumbing@resolvex.edu / staff123
- **Student**: student@resolvex.edu / student123

### 4. Frontend

```bash
cd resolvex/frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/complaints | List complaints (filtered by role) |
| POST | /api/complaints | Create complaint (student) |
| GET | /api/complaints/:id | Get complaint |
| PATCH | /api/complaints/:id | Update complaint (admin/staff) |
| POST | /api/complaints/classify | NLP classify preview |
| GET | /api/notifications | User notifications |
| GET | /api/analytics/* | Analytics endpoints (admin) |
| GET | /api/users/staff | Staff list (admin) |

## Environment Variables

**Backend (.env)**
- `PORT` - Server port (default 5000)
- `DB_HOST` - MySQL host (default localhost)
- `DB_PORT` - MySQL port (default 3306)
- `DB_NAME` - Database name (default resolvex)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `JWT_SECRET` - Secret for JWT signing
- `JWT_EXPIRE` - Token expiry (e.g. 7d)
- `UPLOAD_PATH` - Path for uploaded images
- `MAX_FILE_SIZE` - Max file size in bytes

## Deployment

1. Set `NODE_ENV=production`
2. Use a production MySQL database
3. Set strong `JWT_SECRET`
4. Build frontend: `npm run build`
5. Serve frontend static files from Express or use a CDN
6. Configure CORS with your frontend URL

## License

MIT
