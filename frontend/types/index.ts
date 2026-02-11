export interface Employee {
  _id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at: string;
}

export interface EmployeeCreate {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

export interface Attendance {
  _id: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  status: 'Present' | 'Absent';
  created_at: string;
}

export interface AttendanceCreate {
  employee_id: string;
  date: string;
  status: 'Present' | 'Absent';
}

export interface DashboardStats {
  total_employees: number;
  total_attendance_records: number;
  present_today: number;
  absent_today: number;
}

export interface ApiError {
  detail: string;
}
