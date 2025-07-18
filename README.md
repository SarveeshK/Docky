# Docky

A full-stack document submission system built with Flask (Python), React.js, SQLite, JWT authentication, and Tailwind CSS.

## Features
- User/Admin authentication (JWT)
- Document upload and management
- Submission deadline enforcement
- Admin dashboard for review and comments
- Responsive UI with Tailwind CSS

## Getting Started

### Backend
1. `cd backend`
2. `python3 -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt`
4. `flask run`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`

---

## Folder Structure
- `/backend`: Flask API, models, uploads
- `/frontend`: React app, Tailwind CSS

---

## Database
- SQLite via SQLAlchemy
- Seeded with test data on first run

---

## Environment
- Development-ready
- CORS enabled
- JWT secret in `.env`

---

## File Uploads
- Stored in `/backend/uploads/`

---

## License
MIT
