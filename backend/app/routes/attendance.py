from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from ..models import AttendanceCreate, AttendanceResponse, DashboardStats, PaginatedAttendanceResponse, PaginationMeta
from ..database import get_database
from bson import ObjectId
import math

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    """Mark attendance for an employee"""
    db = await get_database()

    # Check if employee exists
    employee = await db.employees.find_one({"employee_id": attendance.employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{attendance.employee_id}' not found"
        )

    # Convert date to datetime for MongoDB compatibility
    attendance_datetime = datetime.combine(attendance.date, datetime.min.time())

    # Check if attendance already marked for this date
    existing_attendance = await db.attendance.find_one({
        "employee_id": attendance.employee_id,
        "date": attendance_datetime
    })

    if existing_attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Attendance for employee '{attendance.employee_id}' on {attendance.date} already marked"
        )

    # Create attendance document
    attendance_dict = attendance.model_dump()
    attendance_dict["date"] = attendance_datetime  # Convert date to datetime
    attendance_dict["created_at"] = datetime.utcnow()

    result = await db.attendance.insert_one(attendance_dict)
    created_attendance = await db.attendance.find_one({"_id": result.inserted_id})

    # Convert datetime back to date for response
    if "date" in created_attendance and isinstance(created_attendance["date"], datetime):
        created_attendance["date"] = created_attendance["date"].date()

    # Add employee name to response
    created_attendance["_id"] = str(created_attendance["_id"])
    created_attendance["employee_name"] = employee.get("full_name")

    return created_attendance


@router.get("", response_model=PaginatedAttendanceResponse)
async def get_all_attendance(
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    date: Optional[date] = Query(None, description="Filter by date"),
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    limit: int = Query(50, ge=1, le=100, description="Items per page (max 100)")
):
    """Get attendance records with pagination and optional filters"""
    db = await get_database()

    # Build match filter
    match_filter = {}
    if employee_id:
        match_filter["employee_id"] = employee_id.upper()
    if date:
        # Convert date to datetime for MongoDB compatibility
        match_filter["date"] = datetime.combine(date, datetime.min.time())

    # Get total count
    total = await db.attendance.count_documents(match_filter)

    # Calculate skip
    skip = (page - 1) * limit

    # Use aggregation pipeline for efficient join with pagination
    pipeline = [
        {"$match": match_filter},
        {"$sort": {"date": -1}},
        {"$skip": skip},
        {"$limit": limit},
        {
            "$lookup": {
                "from": "employees",
                "localField": "employee_id",
                "foreignField": "employee_id",
                "as": "employee_info"
            }
        },
        {
            "$addFields": {
                "employee_name": {
                    "$ifNull": [
                        {"$arrayElemAt": ["$employee_info.full_name", 0]},
                        "Unknown"
                    ]
                }
            }
        },
        {"$project": {"employee_info": 0}}  # Remove the joined array
    ]

    attendance_records = []
    async for record in db.attendance.aggregate(pipeline):
        record["_id"] = str(record["_id"])

        # Convert datetime back to date for response
        if "date" in record and isinstance(record["date"], datetime):
            record["date"] = record["date"].date()

        attendance_records.append(record)

    # Calculate total pages
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "data": attendance_records,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    }


@router.get("/employee/{employee_id}", response_model=PaginatedAttendanceResponse)
async def get_employee_attendance(
    employee_id: str,
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    limit: int = Query(50, ge=1, le=100, description="Items per page (max 100)")
):
    """Get attendance records for a specific employee with pagination"""
    db = await get_database()

    # Check if employee exists and get name in one query
    employee = await db.employees.find_one(
        {"employee_id": employee_id.upper()},
        {"full_name": 1, "_id": 0}
    )
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )

    employee_name = employee.get("full_name", "Unknown")

    # Get total count for this employee
    total = await db.attendance.count_documents({"employee_id": employee_id.upper()})

    # Calculate skip
    skip = (page - 1) * limit

    # Fetch paginated attendance records
    attendance_records = []
    cursor = db.attendance.find({"employee_id": employee_id.upper()}).sort("date", -1).skip(skip).limit(limit)

    async for record in cursor:
        record["_id"] = str(record["_id"])

        # Convert datetime back to date for response
        if "date" in record and isinstance(record["date"], datetime):
            record["date"] = record["date"].date()

        record["employee_name"] = employee_name
        attendance_records.append(record)

    # Calculate total pages
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "data": attendance_records,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    }


@router.get("/stats/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics"""
    db = await get_database()

    # Total employees
    total_employees = await db.employees.count_documents({})

    # Total attendance records
    total_attendance = await db.attendance.count_documents({})

    # Today's date (convert to datetime for MongoDB compatibility)
    today = date.today()
    today_datetime = datetime.combine(today, datetime.min.time())

    # Present today
    present_today = await db.attendance.count_documents({
        "date": today_datetime,
        "status": "Present"
    })

    # Absent today
    absent_today = await db.attendance.count_documents({
        "date": today_datetime,
        "status": "Absent"
    })

    return {
        "total_employees": total_employees,
        "total_attendance_records": total_attendance,
        "present_today": present_today,
        "absent_today": absent_today
    }


@router.delete("/{attendance_id}", status_code=status.HTTP_200_OK)
async def delete_attendance(attendance_id: str):
    """Delete an attendance record"""
    db = await get_database()

    # Validate ObjectId
    if not ObjectId.is_valid(attendance_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid attendance ID format"
        )

    # Check if attendance exists
    attendance = await db.attendance.find_one({"_id": ObjectId(attendance_id)})
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance record not found"
        )

    # Delete attendance
    await db.attendance.delete_one({"_id": ObjectId(attendance_id)})

    return {"message": "Attendance record deleted successfully"}
