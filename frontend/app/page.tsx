'use client';

import { useEffect, useState, useRef } from 'react';
import { attendanceAPI } from '@/lib/api';
import { DashboardStats } from '@/types';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Refs to prevent redundant calls
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);

  useEffect(() => {
    fetchStats();

    // Cleanup: abort pending request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchStats = async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }

    // Check cache validity - skip if fetched recently
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (stats && timeSinceLastFetch < CACHE_DURATION) {
      setLoading(false);
      return;
    }

    try {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      isFetchingRef.current = true;

      setLoading(true);
      setError('');

      const data = await attendanceAPI.getStats();

      setStats(data);
      lastFetchTimeRef.current = Date.now();
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      setError(err.response?.data?.detail || 'Failed to fetch dashboard stats');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return <Alert type="error" message={error} onClose={() => setError('')} />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your HR system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.total_employees || 0}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.total_attendance_records || 0}
              </p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats?.present_today || 0}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats?.absent_today || 0}
              </p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to HRMS Lite</h2>
          <div className="prose text-gray-600">
            <p className="mb-3">
              This is a lightweight Human Resource Management System designed to help you manage
              employees and track daily attendance efficiently.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">👥 Employee Management</h3>
                <p className="text-sm">
                  Add, view, and manage employee records with unique IDs, contact information,
                  and department assignments.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">📅 Attendance Tracking</h3>
                <p className="text-sm">
                  Mark and monitor daily attendance for all employees. Track present and absent
                  status with date-wise records.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
