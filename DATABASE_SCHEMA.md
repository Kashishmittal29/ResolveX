# ResolveX Database Schema (MongoDB)

ResolveX uses **MongoDB** via **Mongoose** as its primary database.

## Collections

### users
Stores credentials, roles, and profiles of all users (students, staff, administrators).

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | String | User's full name |
| `email` | String | Unique lowercase email |
| `password` | String | Hashed password (bcrypt) |
| `role` | String (Enum) | `student`, `staff`, or `admin` |
| `department` | String (Enum) | Department code (e.g. `ELECTRICAL`, `PLUMBING`, `HVAC`, `IT_SUPPORT`, `INFRASTRUCTURE`, `GENERAL`) |
| `studentId` | String | Optional student identifier |
| `phone` | String | Optional phone number |
| `avatar` | String | URL of profile picture (Cloudinary) |
| `isActive` | Boolean | Account status indicator (default `true`) |
| `createdAt` | Date | Auto-generated timestamp |
| `updatedAt` | Date | Auto-generated timestamp |

### complaints
Contains campus complaints, automatic assignment status, timeline logs, and SLA settings.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `complaintId` | String | Unique formatted ID (e.g. `RX-SEED-1001`) |
| `title` | String | Complaint title |
| `description` | String | Detailed description |
| `category` | String (Enum) | `ELECTRICAL`, `PLUMBING`, `HVAC`, `IT_SUPPORT`, `INFRASTRUCTURE`, `GENERAL` |
| `location` | String | Location details |
| `priority` | String (Enum) | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `priorityScore` | Number | Priority priority rating (0 to 1) |
| `status` | String (Enum) | `PENDING`, `IN_PROGRESS`, `RESOLVED`, `ESCALATED` |
| `image` | String | Cloudinary URL for optional attachments |
| `submittedBy` | ObjectId | Reference to `User` |
| `assignedTo` | ObjectId | Reference to `User` (staff members) |
| `assignedDepartment` | String | Name of the assigned department |
| `timeline` | Array (Subdoc) | Chronological status transition history (see structure below) |
| `slaDeadline` | Date | Calculated resolution SLA target deadline |
| `resolvedAt` | Date | Timestamp of resolution |
| `escalationReason`| String | Reason provided during SLA escalation |
| `nlpCategory` | String | AI-suggested category |
| `nlpPriority` | String | AI-suggested priority |
| `createdAt` | Date | Auto-generated timestamp |
| `updatedAt` | Date | Auto-generated timestamp |

#### Timeline Subdocument Schema
Each update to the complaint status inserts a record to `timeline`:
- `status`: String (Enum) - New status state.
- `note`: String - Action summary or details.
- `updatedBy`: ObjectId - Reference to `User` who triggered the status update.
- `timestamp`: Date - Date when the transition occurred.

### notifications
System notifications pushed to the database (and optionally synchronized to Firebase Firestore).

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `userId` | ObjectId | Reference to target `User` |
| `complaintId` | ObjectId | Reference to context `Complaint` |
| `type` | String (Enum) | `STATUS_CHANGE`, `ASSIGNMENT`, `NEW_COMPLAINT`, `ESC_WARNING`, `ESCALATION` |
| `title` | String | Short notification title |
| `message` | String | Detailed notification message |
| `isRead` | Boolean | Visibility toggle (default `false`) |
| `createdAt` | Date | Auto-generated timestamp |
| `updatedAt` | Date | Auto-generated timestamp |

---

## Connection Configuration

The database uses the `MONGODB_URI` environment variable.

1. **Local Setup**:
   Ensure local MongoDB server is running:
   ```bash
   mongod --dbpath <data_dir>
   ```
   Add connection to `.env`:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/resolvex
   ```
2. **Cloud/Production Setup**:
   Supply standard connection string containing credentials (e.g. for Vercel/Render):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/resolvex
   ```
