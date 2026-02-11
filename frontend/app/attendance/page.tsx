'use client';

import { useEffect, useState } from 'react';
import { employeeAPI, attendanceAPI } from '@/lib/api';
import { Employee, Attendance, AttendanceCreate } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import Alert from '@/components/ui/Alert';

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [formData, setFormData] = useState<AttendanceCreate>({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
  });
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filterDate, filterEmployee]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [employeesData, attendanceData] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getAll(),
      ]);

      // Ensure data is an array
      if (Array.isArray(employeesData)) {
        setEmployees(employeesData);
      } else {
        console.error('API returned non-array employees data:', employeesData);
        setEmployees([]);
      }

      if (Array.isArray(attendanceData)) {
        setAttendance(attendanceData);
      } else {
        console.error('API returned non-array attendance data:', attendanceData);
        setAttendance([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setEmployees([]); // Reset to empty arrays on error
      setAttendance([]);
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setError('');
      const filters: any = {};
      if (filterDate) filters.date = filterDate;
      if (filterEmployee) filters.employee_id = filterEmployee;

      const data = await attendanceAPI.getAll(filters);

      // Ensure data is an array
      if (Array.isArray(data)) {
        setAttendance(data);
      } else {
        console.error('API returned non-array attendance data:', data);
        setAttendance([]);
        setError('Invalid data format received from server');
      }
    } catch (err: any) {
      console.error('Failed to fetch attendance:', err);
      setAttendance([]); // Reset to empty array on error
      setError(err.response?.data?.detail || 'Failed to fetch attendance');
    }
  };

  const validateForm = () => {
    const errors: any = {};

    if (!formData.employee_id) {
      errors.employee_id = 'Employee is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (!formData.status) {
      errors.status = 'Status is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setError('');
      await attendanceAPI.create(formData);
      setSuccess('Attendance marked successfully!');
      setFormData({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
      });
      setShowForm(false);
      fetchAttendance();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark attendance');
    }
  };

  const handleDelete = async (attendanceId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      setError('');
      await attendanceAPI.delete(attendanceId);
      setSuccess('Attendance record deleted successfully!');
      fetchAttendance();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete attendance');
    }
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterEmployee('');
  };

  if (loading) {
    return <Loading message="Loading attendance..." />;
  }

  const employeeOptions = employees.map((emp) => ({
    value: emp.employee_id,
    label: `${emp.employee_id} - ${emp.full_name}`,
  }));

  // Calculate stats
  const totalPresent = attendance.filter((a) => a.status === 'Present').length;
  const totalAbsent = attendance.filter((a) => a.status === 'Absent').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-2">Track and manage employee attendance</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Mark Attendance'}
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Records</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{attendance.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Present</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{totalPresent}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Absent</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{totalAbsent}</p>
          </div>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mark Attendance</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-3 gap-4">
              <Select
                label="Employee"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                error={formErrors.employee_id}
                options={employeeOptions}
              />
              <Input
                label="Date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={formErrors.date}
              />
              <Select
                label="Status"
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'Present' | 'Absent' })
                }
                error={formErrors.status}
                options={[
                  { value: 'Present', label: 'Present' },
                  { value: 'Absent', label: 'Absent' },
                ]}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit">Mark Attendance</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            label="Filter by Date"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <Select
            label="Filter by Employee"
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            options={employeeOptions}
          />
          <div className="flex items-end">
            <Button variant="secondary" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {attendance.length === 0 ? (
          <EmptyState
            title="No attendance records found"
            description="Start marking attendance for your employees"
            icon="📅"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td className="font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td>{record.employee_id}</td>
                    <td>{record.employee_name || 'Unknown'}</td>
                    <td>
                      <span
                        className={`badge ${
                          record.status === 'Present' ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(record._id)}
                        className="text-sm py-1 px-3"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
