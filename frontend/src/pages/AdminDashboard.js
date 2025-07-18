import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

export default function AdminDashboard() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Filter states
  const [filterUser, setFilterUser] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [viewFile, setViewFile] = useState(null); // { url, title, type }
  const [editComments, setEditComments] = useState({}); // { [docId]: comment }

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async (filters = {}) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Session expired. Please log in again.');
        setLoading(false);
        return;
      }
      // Build query params
      const params = {};
      if (filters.user_name) params.user_name = filters.user_name;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      const res = await axios.get('/api/admin/documents', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setDocs(res.data);
    } catch (err) {
      toast.error('Failed to fetch documents');
    }
    setLoading(false);
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchDocs({
      user_name: filterUser,
      start_date: filterStart,
      end_date: filterEnd
    });
  };

  const handleCommentChange = (docId, value) => {
    setEditComments(prev => ({ ...prev, [docId]: value }));
  };

  const handleSave = async (docId, is_viewed) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Session expired. Please log in again.');
        setLoading(false);
        return;
      }
      await axios.put(`/api/admin/documents/${docId}`, { is_viewed, admin_comment: editComments[docId] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Saved!');
      fetchDocs({
        user_name: filterUser,
        start_date: filterStart,
        end_date: filterEnd
      });
    } catch (err) {
      toast.error('Update failed');
    }
    setLoading(false);
  };

  const handleViewFile = async (doc) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/documents/view/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch file');
      const contentType = res.headers.get('Content-Type');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setViewFile({ url, title: doc.title, type: contentType });
    } catch (err) {
      toast.error('Could not preview file');
    }
    setLoading(false);
  };

  const handleDownloadFile = async (doc) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/documents/download/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to download file');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename || doc.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Could not download file');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-700">Admin Dashboard</h2>
          <a href="/admin/deadline" className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition">Set Deadline</a>
        </div>
        {/* Filter Controls */}
        <form className="flex flex-wrap gap-2 bg-white p-4 rounded-xl shadow border border-blue-100 mb-4" onSubmit={handleFilter}>
          <input type="text" placeholder="User Name" value={filterUser} onChange={e => setFilterUser(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200" />
          <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200" />
          <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition">Filter</button>
        </form>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
          {loading ? <div>Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="p-2 font-semibold">User</th>
                    <th className="p-2 font-semibold">Title</th>
                    <th className="p-2 font-semibold">Uploaded</th>
                    <th className="p-2 font-semibold">Viewed</th>
                    <th className="p-2 font-semibold">Comment</th>
                    <th className="p-2 font-semibold">File</th>
                    <th className="p-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map(doc => (
                    <tr key={doc.id} className="border-b last:border-0 hover:bg-blue-50/50">
                      <td className="p-2">{doc.user_name}</td>
                      <td className="p-2">{doc.title}</td>
                      <td className="p-2">{new Date(doc.upload_datetime).toLocaleString()}</td>
                      <td className="p-2">
                        <input type="checkbox" checked={doc.is_viewed} onChange={e => handleSave(doc.id, e.target.checked)} />
                      </td>
                      <td className="p-2">
                        <textarea
                          value={editComments[doc.id] !== undefined ? editComments[doc.id] : doc.admin_comment || ''}
                          onChange={e => handleCommentChange(doc.id, e.target.value)}
                          className="border p-1 rounded w-32 focus:ring-2 focus:ring-blue-200"
                        />
                      </td>
                      <td className="p-2 flex gap-2 items-center">
                        <button
                          type="button"
                          className="text-blue-500 underline"
                          onClick={() => handleDownloadFile(doc)}
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          className="text-blue-600 underline hover:text-blue-800 font-medium"
                          onClick={() => handleViewFile(doc)}
                        >
                          View
                        </button>
                      </td>
                      <td className="p-2">
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                          onClick={() => handleSave(doc.id, doc.is_viewed)}
                          type="button"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* File Preview Modal */}
        {viewFile && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
                onClick={() => {
                  URL.revokeObjectURL(viewFile.url);
                  setViewFile(null);
                }}
              >
                ×
              </button>
              <h3 className="text-lg font-bold mb-4 text-blue-700">{viewFile.title}</h3>
              <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100 rounded">
                {viewFile.type && viewFile.type.startsWith('image') ? (
                  <img src={viewFile.url} alt={viewFile.title} className="max-h-full max-w-full rounded shadow" />
                ) : viewFile.type && viewFile.type === 'application/pdf' ? (
                  <iframe src={viewFile.url} title={viewFile.title} className="w-full h-full rounded border" frameBorder="0" />
                ) : (
                  <div className="text-gray-500">Preview not available for this file type.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
