# ResolveX - Where Every Concern Finds a Resolution



A production-ready campus complaint and maintenance management system that allows students to submit complaints digitally, track resolution status in real-time, and enables administrators to manage, prioritize, and resolve issues efficiently.

## ✨ Features

### Core Functionality
- **Role-based Authentication**: Student, Staff, Admin with JWT + bcrypt
- **Complaint Submission**: Title, description, category, location, priority, optional image
- **NLP Classification**: Auto-detect category and urgency using keyword-based NLP
- **Smart Auto-Assignment**: Assign complaints to staff by department and workload
- **SLA Escalation**: Auto-escalate complaints that exceed time limits
- **Analytics Dashboard**: Trends, category/priority charts, department performance

### 🔧 New Enterprise Features
- **Cloud Uploads**: Cloudinary CDN for image storage (no server disk needed)
- **Email Notifications**: Nodemailer integration for real-time email alerts
- **Real-time Notifications**: Firebase Firestore for instant notification sync (no polling!)
- **Database Security**: SSL/TLS, sanitization, rate limiting, helmet security headers
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- **Comprehensive Testing**: Jest unit + integration tests with 80%+ coverage
- **Production Ready**: Security hardening, error handling, monitoring

## 📊 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, React Router, Firebase SDK
- **Backend**: Node.js 18+, Express.js, TypeScript-ready
- **Database**: MySQL + Sequelize ORM
- **Auth**: JWT, bcrypt
- **Cloud Services**: Cloudinary (image CDN), Firebase Firestore (real-time DB), Nodemailer (email)
- **Testing**: Jest, Supertest
- **CI/CD**: GitHub Actions

## 🏗️ Project Structure

```
resolvex/
├── .github/workflows/          # GitHub Actions CI/CD
│   ├── ci.yml                 # Test & build pipeline
│   └── deploy.yml             # Deployment pipeline
├── backend/
│   ├── config/                # Database, Firebase, SLA config
│   ├── models/                # User, Complaint, Notification
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth, sanitization, security
│   ├── services/              # Email, NLP, notifications, auto-assignment
│   ├── jobs/                  # SLA escalation cron job
│   ├── __tests__/             # Jest test suites
│   ├── .env.example           # Environment template
│   └── server.js              # Express app
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── config/            # Firebase config
│   │   ├── context/           # Auth context
│   │   ├── pages/             # Page components
│   │   └── utils/             # API client
│   ├── .env.example           # Environment template
│   └── package.json
├── DATABASE_SCHEMA.md         # Database design
├── CICD_EXPLAINED.md         # CI/CD pipeline documentation
├── FIREBASE_SETUP.md         # Firebase setup guide
├── README.md                 # This file
└── LICENSE
```

## 📋 Prerequisites

- Node.js 18+ and npm
- MySQL 5.7+ or MariaDB
- Firebase account (free tier available)
- Cloudinary account (free tier: 25GB/month)

## 🚀 Quick Start

### 1. Database Setup

```bash
mysql -u root -p
CREATE DATABASE resolvex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your:
# - MySQL credentials
# - JWT_SECRET (generate random string)
# - Cloudinary credentials
# - Email credentials (Gmail, Outlook, or Mailtrap)
# - Firebase service account path

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Copy and configure environment
cp .env.example .env.local
# Edit .env.local with:
# - VITE_FIREBASE_* keys (from Firebase console)
# - VITE_API_BASE_URL (if not localhost:5000)

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

**Sample Credentials:**
- Admin: `admin@resolvex.edu` / `admin123`
- Staff (Electrical): `Kritikarupesh1234@gmail.com` / `staff123`
- Staff (Plumbing): `staff.plumbing@resolvex.edu` / `staff123`
- Student: `student@resolvex.edu` / `student123`

## 📚 Documentation

### Core Documentation
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database design and structure
- [backend/DATABASE_SECURITY.md](backend/DATABASE_SECURITY.md) - Security implementation
- [backend/TESTING_GUIDE.md](backend/TESTING_GUIDE.md) - How to write and run tests

### Integration Guides
- [backend/NODEMAILER_SETUP.md](backend/NODEMAILER_SETUP.md) - Email configuration (Gmail, Outlook, Mailtrap)
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Real-time notifications setup
- [CICD_EXPLAINED.md](CICD_EXPLAINED.md) - GitHub Actions pipeline

## 🧪 Testing

### Run Tests

```bash
cd backend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**
- Unit tests for password hashing, JWT, NLP classifier
- Integration tests for auth, complaints, auto-assignment
- ~45+ test cases

## 🔐 Security Features

✅ **Implemented:**
- SSL/TLS database connections
- Input sanitization (prevents injection attacks)
- Rate limiting (100 req/15min general, 10 req/15min for auth)
- Helmet.js security headers
- bcrypt password hashing (12 rounds)
- JWT authentication with expiry
- CORS configured
- Environment variable secrets management

See [backend/DATABASE_SECURITY.md](backend/DATABASE_SECURITY.md) for detailed security documentation.

## ☁️ Cloud Services

### Cloudinary (Image CDN)
- ✅ **Replaces local file storage**
- Automatic image optimization
- Global CDN delivery
- Free tier: 25GB storage + 25GB bandwidth/month
- [Setup Instructions](backend/utils/upload.js)

### Firebase Firestore (Real-time Notifications)
- ✅ **Real-time notification sync** (no polling!)
- Live unread badge updates
- Automatic data synchronization
- Free tier: 50,000 reads/day
- [Setup Guide](FIREBASE_SETUP.md)

### Nodemailer (Email Notifications)
- ✅ **Email on key events**
  - Complaint submitted
  - Assigned to staff
  - Resolved
  - SLA breached
- Gmail App Passwords, Outlook, or Mailtrap support
- [Configuration Guide](backend/NODEMAILER_SETUP.md)

## 🔄 CI/CD Pipeline

GitHub Actions automation:

**CI Pipeline (on every push/PR):**
- ✅ Run backend tests (Jest)
- ✅ Build frontend (Vite)
- ✅ Lint code (ESLint)
- ✅ Check security

**Deploy Pipeline (on main branch):**
- ✅ Build backend & frontend
- ✅ Run smoke tests
- ✅ Deploy to production

[View pipeline details](CICD_EXPLAINED.md)

## 📊 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/complaints | List complaints (role-filtered) |
| POST | /api/complaints | Submit complaint (image upload) |
| GET | /api/complaints/:id | Get complaint details |
| PATCH | /api/complaints/:id | Update status/assignment |
| POST | /api/complaints/classify | NLP preview classification |
| GET | /api/notifications | Get user notifications |
| GET | /api/analytics/* | Dashboard analytics |
| GET | /api/users/staff | List staff members |

## ⚙️ Environment Variables

### Backend (.env)

```env
# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (MongoDB)
MONGODB_URI=mongodb://127.0.0.1:27017/resolvex

# Database (Legacy/Reference MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=resolvex
DB_USER=root
DB_PASSWORD=Kartik01sharma@

# Auth
JWT_SECRET=a8f3d2e1b9c4f7a2d5e8b1c4f7a2d5e8b1c4f7a2d5e8b1c4f7a2d5e8
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=doszkxo4n
CLOUDINARY_API_KEY=749963614788946
CLOUDINARY_API_SECRET=gTmQN62Iak09l2y88g2ztApyd54

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ks9034214356@gmail.com
EMAIL_PASS=jqmksjzxcymyveki
EMAIL_FROM=noreply@resolvex.edu

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-service-account.json
```

### Frontend (.env.local)

```env
# API
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=ResolveX

# Firebase
VITE_FIREBASE_API_KEY=AIzaSyDyRnySQYBETpRqX-8gNtUYgMWx4wIctH4
VITE_FIREBASE_AUTH_DOMAIN=resolve-x-fec05.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=resolve-x-fec05
VITE_FIREBASE_STORAGE_BUCKET=resolve-x-fec05.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=587447441930
VITE_FIREBASE_APP_ID=1:587447441930:web:354c895b3dceba49501df3
VITE_FIREBASE_MEASUREMENT_ID=G-844QDDGZTZ

# Feature Flags
VITE_ENABLE_FIREBASE=true
VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
VITE_DEBUG_MODE=false
```

See [backend/.env.example](backend/.env.example) and [frontend/.env.example](frontend/.env.example) for templates.

## 🚀 Production Deployment

### Prerequisites
- Set `NODE_ENV=production`
- Use production MySQL database
- Generate strong `JWT_SECRET` (use `openssl rand -base64 32`)
- Configure email service (use campus SMTP or Gmail App Password)
- Set up Firebase project for production
- Update Firestore security rules

### Deployment Options

**Option 1: Render.com** (recommended for beginners)
- Connect GitHub repo
- Auto-deploys on push to main
- $7/month for web service

**Option 2: Railway.app**
- GitHub integration
- MySQL database included
- $5/month starting price

**Option 3: AWS/GCP/Azure**
- More control
- Complex setup
- Use Docker for containerization

See [CICD_EXPLAINED.md](CICD_EXPLAINED.md#deployment-strategies) for detailed deployment instructions.

## 📈 Performance

- **Page Load**: ~1.5s (optimized with Vite + compression)
- **Real-time Notifications**: <100ms (Firebase Firestore)
- **Database Queries**: <100ms (with indexes)
- **Test Execution**: ~12s (full suite with Docker MySQL)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test: `npm test`
3. Commit with clear messages
4. Push and create Pull Request
5. Wait for CI to pass
6. Merge after review

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Check port 5000 is available
lsof -i :5000

# Check .env is configured
cat backend/.env
```

### Frontend shows "Cannot GET"
```bash
# Make sure backend is running
curl http://localhost:5000/api/health

# Check VITE_API_BASE_URL in .env.local
cat frontend/.env.local
```

### Tests fail
```bash
# Install dependencies
cd backend && npm ci

# Make sure test database exists
mysql -u root -p -e "CREATE DATABASE resolvex_test"

# Run with verbose output
npm test -- --verbose
```

### Firebase notifications not working
See [FIREBASE_SETUP.md](FIREBASE_SETUP.md#troubleshooting) for detailed troubleshooting
