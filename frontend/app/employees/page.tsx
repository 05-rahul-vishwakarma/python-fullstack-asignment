'use client';

import { useEffect, useState } from 'react';
import { employeeAPI } from '@/lib/api';
import { Employee, EmployeeCreate } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import Alert from '@/components/ui/Alert';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<EmployeeCreate>({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  });
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await employeeAPI.getAll();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.error('API returned non-array data:', data);
        setEmployees([]);
        setError('Invalid data format received from server');
      }
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]); // Reset to empty array on error
      setError(err.response?.data?.detail || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: any = {};

    if (!formData.employee_id.trim()) {
      errors.employee_id = 'Employee ID is required';
    }

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.department.trim()) {
      errors.department = 'Department is required';
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
      await employeeAPI.create(formData);
      setSuccess('Employee added successfully!');
      setFormData({ employee_id: '', full_name: '', email: '', department: '' });
      setShowForm(false);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add employee');
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm(`Are you sure you want to delete employee ${employeeId}?`)) {
      return;
    }

    try {
      setError('');
      await employeeAPI.delete(employeeId);
      setSuccess('Employee deleted successfully!');
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete employee');
    }
  };

  if (loading) {
    return <Loading message="Loading employees..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage your employee records</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Employee'}
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Employee</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Employee ID"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                error={formErrors.employee_id}
                placeholder="e.g., EMP001"
              />
              <Input
                label="Full Name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                error={formErrors.full_name}
                placeholder="e.g., John Doe"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={formErrors.email}
                placeholder="e.g., john@example.com"
              />
              <Input
                label="Department"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                error={formErrors.department}
                placeholder="e.g., Engineering"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit">Add Employee</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description="Get started by adding your first employee"
            icon="👥"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="font-medium">{employee.employee_id}</td>
                    <td>{employee.full_name}</td>
                    <td>{employee.email}</td>
                    <td>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {employee.department}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(employee.employee_id)}
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
