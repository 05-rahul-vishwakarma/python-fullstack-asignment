from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional
from datetime import datetime
from datetime import date as date_type
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


# Employee Models
class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50, description="Unique employee ID")
    full_name: str = Field(..., min_length=1, max_length=100, description="Full name of employee")
    email: EmailStr = Field(..., description="Email address")
    department: str = Field(..., min_length=1, max_length=100, description="Department name")

    @field_validator('employee_id')
    @classmethod
    def validate_employee_id(cls, v):
        return v.strip().upper()

    @field_validator('full_name', 'department')
    @classmethod
    def validate_strings(cls, v):
        return v.strip()


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeResponse(EmployeeBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# Attendance Models
class AttendanceBase(BaseModel):
    employee_id: str = Field(..., description="Employee ID")
    date: date_type = Field(..., description="Attendance date")
    status: Literal["Present", "Absent"] = Field(..., description="Attendance status")

    @field_validator('employee_id')
    @classmethod
    def validate_employee_id(cls, v):
        return v.strip().upper()


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceResponse(AttendanceBase):
    id: str = Field(alias="_id")
    employee_name: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# Dashboard Stats Model
class DashboardStats(BaseModel):
    total_employees: int
    total_attendance_records: int
    present_today: int
    absent_today: int


# Pagination Models
class PaginationMeta(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int


class PaginatedEmployeeResponse(BaseModel):
    data: list[EmployeeResponse]
    meta: PaginationMeta


class PaginatedAttendanceResponse(BaseModel):
    data: list[AttendanceResponse]
    meta: PaginationMeta
