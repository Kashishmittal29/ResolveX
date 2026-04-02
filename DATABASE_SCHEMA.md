# ResolveX Database Schema (MySQL)

## Tables

### users
| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| id          | INT PK       | Auto-increment                 |
| name        | VARCHAR(100) | Full name                      |
| email       | VARCHAR(100) | Unique, lowercase              |
| password    | VARCHAR(255) | bcrypt hashed                  |
| role        | ENUM         | student, staff, admin          |
| department  | ENUM         | ELECTRICAL, PLUMBING, etc.     |
| studentId   | VARCHAR(50)  | Optional                       |
| phone       | VARCHAR(20)  | Optional                       |
| avatar      | VARCHAR(255) | Optional                       |
| isActive    | BOOLEAN      | Default true                   |
| createdAt   | DATETIME     | Auto                           |
| updatedAt   | DATETIME     | Auto                           |

### complaints
| Column            | Type     | Description                    |
|-------------------|----------|--------------------------------|
| id                | INT PK   | Auto-increment                 |
| complaintId       | VARCHAR  | Unique, e.g. RX-XXX-XXXX       |
| title             | VARCHAR  | Required                       |
| description       | TEXT     | Required                       |
| category          | ENUM     | ELECTRICAL, PLUMBING, etc.     |
| location          | VARCHAR  | Required                       |
| priority          | ENUM     | LOW, MEDIUM, HIGH, CRITICAL    |
| priorityScore     | FLOAT    | 0-1 from NLP                  |
| status            | ENUM     | PENDING, IN_PROGRESS, etc.     |
| image             | VARCHAR  | Optional path                  |
| submittedBy       | INT FK   | References users.id            |
| assignedTo        | INT FK   | References users.id            |
| assignedDepartment| VARCHAR  | Department name                |
| timeline          | JSON     | Array of status updates        |
| slaDeadline       | DATETIME | SLA deadline                   |
| resolvedAt        | DATETIME | When RESOLVED                  |
| escalationReason  | TEXT     | When ESCALATED                 |
| nlpCategory       | VARCHAR  | AI-suggested category          |
| nlpPriority       | VARCHAR  | AI-suggested priority          |
| createdAt         | DATETIME | Auto                           |
| updatedAt         | DATETIME | Auto                           |

### notifications
| Column     | Type     | Description                    |
|------------|----------|--------------------------------|
| id         | INT PK   | Auto-increment                 |
| userId     | INT FK   | References users.id            |
| complaintId| INT FK   | References complaints.id      |
| type       | ENUM     | STATUS_CHANGE, ASSIGNMENT, etc.|
| title      | VARCHAR  | Required                       |
| message    | TEXT     | Required                       |
| isRead     | BOOLEAN  | Default false                  |
| createdAt  | DATETIME | Auto                           |
| updatedAt  | DATETIME | Auto                           |

## Setup

1. Create database: `CREATE DATABASE resolvex;`
2. Configure `.env` with DB_NAME, DB_USER, DB_PASSWORD
3. Run `npm run dev` - Sequelize sync creates tables automatically
4. Or run `database/schema.sql` for manual creation
