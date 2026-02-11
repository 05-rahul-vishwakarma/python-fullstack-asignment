from fastapi import APIRouter, HTTPException, status, Query
from typing import List
from datetime import datetime
from ..models import EmployeeCreate, EmployeeResponse, PaginatedEmployeeResponse, PaginationMeta
from ..database import get_database
from bson import ObjectId
import math

router = APIRouter(prefix="/api/employees", tags=["employees"])


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    """Create a new employee"""
    db = await get_database()

    # Check if employee_id already exists
    existing_employee = await db.employees.find_one({"employee_id": employee.employee_id})
    if existing_employee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee with ID '{employee.employee_id}' already exists"
        )

    # Check if email already exists
    existing_email = await db.employees.find_one({"email": employee.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee with email '{employee.email}' already exists"
        )

    # Create employee document
    employee_dict = employee.model_dump()
    employee_dict["created_at"] = datetime.utcnow()

    result = await db.employees.insert_one(employee_dict)
    created_employee = await db.employees.find_one({"_id": result.inserted_id})

    # Convert ObjectId to string
    created_employee["_id"] = str(created_employee["_id"])

    return created_employee


@router.get("", response_model=PaginatedEmployeeResponse)
async def get_all_employees(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    limit: int = Query(50, ge=1, le=100, description="Items per page (max 100)")
):
    """Get all employees with pagination"""
    db = await get_database()

    # Get total count
    total = await db.employees.count_documents({})

    # Calculate skip
    skip = (page - 1) * limit

    # Get paginated data
    employees = []
    cursor = db.employees.find().sort("created_at", -1).skip(skip).limit(limit)

    async for employee in cursor:
        employee["_id"] = str(employee["_id"])
        employees.append(employee)

    # Calculate total pages
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "data": employees,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    }


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    """Get a single employee by employee_id"""
    db = await get_database()

    employee = await db.employees.find_one({"employee_id": employee_id.upper()})

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )

    employee["_id"] = str(employee["_id"])
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
async def delete_employee(employee_id: str):
    """Delete an employee"""
    db = await get_database()

    # Check if employee exists
    employee = await db.employees.find_one({"employee_id": employee_id.upper()})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )

    # Delete employee
    await db.employees.delete_one({"employee_id": employee_id.upper()})

    # Also delete all attendance records for this employee
    await db.attendance.delete_many({"employee_id": employee_id.upper()})

    return {"message": f"Employee '{employee_id}' and associated attendance records deleted successfully"}
