import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import Layout from '../components/Layout';

export default function SetDeadline() {
  const [deadline, setDeadline] = useState('');
  const [current, setCurrent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCurrent();
  }, []);

  const fetchCurrent = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get('/api/settings/deadline', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrent(res.data.deadline_datetime);
    } catch {}
  };

  const handleSet = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = getToken();
      if (!token) {
        setError('Session expired. Please log in again.');
        return;
      }
      await axios.post('/api/settings/deadline', { deadline_datetime: deadline }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Deadline updated!');
      fetchCurrent();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set deadline');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <form className="bg-white p-10 rounded-2xl shadow-xl w-96 flex flex-col gap-4 border border-blue-100" onSubmit={handleSet}>
          <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">Set Submission Deadline</h2>
          <div className="mb-2 text-center text-blue-700">Current: {current ? new Date(current).toLocaleString() : 'Not set'}</div>
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="mb-4 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200" required />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {success && <div className="text-green-500 mb-2">{success}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition">Set Deadline</button>
          <div className="mt-4 text-center">
            <a href="/admin" className="text-blue-500 hover:underline">Back to Dashboard</a>
          </div>
        </form>
      </div>
    </Layout>
  );
}
