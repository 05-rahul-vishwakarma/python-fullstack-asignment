import axios from 'axios';
import { Employee, EmployeeCreate, Attendance, AttendanceCreate, DashboardStats } from '@/types';

const API_URL = "https://python-fullstack-asignment-backend.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee API calls
export const employeeAPI = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/api/employees');
    // Handle paginated response format: { data: [...], meta: {...} }
    return response.data.data || response.data;
  },

  getById: async (employeeId: string): Promise<Employee> => {
    const response = await api.get(`/api/employees/${employeeId}`);
    return response.data.data || response.data;
  },

  create: async (employee: EmployeeCreate): Promise<Employee> => {
    const response = await api.post('/api/employees', employee);
    return response.data.data || response.data;
  },

  delete: async (employeeId: string): Promise<void> => {
    await api.delete(`/api/employees/${employeeId}`);
  },
};

// Attendance API calls
export const attendanceAPI = {
  getAll: async (filters?: { employee_id?: string; date?: string }): Promise<Attendance[]> => {
    const response = await api.get('/api/attendance', { params: filters });
    // Handle paginated response format: { data: [...], meta: {...} }
    return response.data.data || response.data;
  },

  getByEmployee: async (employeeId: string): Promise<Attendance[]> => {
    const response = await api.get(`/api/attendance/employee/${employeeId}`);
    return response.data.data || response.data;
  },

  create: async (attendance: AttendanceCreate): Promise<Attendance> => {
    const response = await api.post('/api/attendance', attendance);
    return response.data.data || response.data;
  },

  delete: async (attendanceId: string): Promise<void> => {
    await api.delete(`/api/attendance/${attendanceId}`);
  },

  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/attendance/stats/dashboard');
    return response.data.data || response.data;
  },
};

export default api;
