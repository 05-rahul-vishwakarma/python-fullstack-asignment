# HRMS Lite - Backend API

FastAPI backend for HRMS Lite application with MongoDB.

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **MongoDB** - NoSQL database with Motor (async driver)
- **Pydantic** - Data validation
- **Python 3.9+**

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URL=mongodb+srv://your-username:your-password@cluster.mongodb.net/
DATABASE_NAME=hrms_lite
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

### 4. Run the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload

# Or using Python directly
python -m app.main
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Employees

- `POST /api/employees` - Create new employee
- `GET /api/employees` - Get all employees
- `GET /api/employees/{employee_id}` - Get employee by ID
- `DELETE /api/employees/{employee_id}` - Delete employee

### Attendance

- `POST /api/attendance` - Mark attendance
- `GET /api/attendance` - Get all attendance (supports filters)
- `GET /api/attendance/employee/{employee_id}` - Get employee attendance
- `GET /api/attendance/stats/dashboard` - Get dashboard statistics
- `DELETE /api/attendance/{attendance_id}` - Delete attendance record

## Deployment

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from `.env`

### Deploy to Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will auto-detect Python and FastAPI
4. Add environment variables
5. Deploy!

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application
│   ├── database.py       # MongoDB connection
│   ├── models.py         # Pydantic models
│   └── routes/
│       ├── employees.py  # Employee endpoints
│       └── attendance.py # Attendance endpoints
├── requirements.txt
├── .env.example
└── README.md
```

## Database Schema

### Employee Collection

```json
{
  "_id": "ObjectId",
  "employee_id": "string (unique)",
  "full_name": "string",
  "email": "string (unique, validated)",
  "department": "string",
  "created_at": "datetime"
}
```

### Attendance Collection

```json
{
  "_id": "ObjectId",
  "employee_id": "string (reference)",
  "date": "date",
  "status": "Present | Absent",
  "created_at": "datetime"
}
```

## Validation Rules

- Employee ID: Required, unique, auto-uppercase
- Email: Required, unique, valid format
- Full Name: Required, 1-100 characters
- Department: Required, 1-100 characters
- Attendance Date: Required, valid date
- Status: Must be "Present" or "Absent"

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include detailed messages for debugging.
