import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { FaFileImage, FaFilePdf, FaFileAlt, FaFileAudio, FaFileVideo, FaFileArchive, FaFile } from 'react-icons/fa';
import { FaFileUpload, FaCloudDownloadAlt, FaCommentDots } from 'react-icons/fa';

function Badge({ children, color }) {
  const colorMap = {
    reviewed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    default: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colorMap[color] || colorMap.default}`}>{children}</span>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000); // in seconds
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return date.toLocaleString();
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
      title="Back to Top"
    >
      ↑
    </button>
  );
}

function highlightMatch(text, search) {
  if (!search) return text;
  const parts = text.split(new RegExp(`(${search})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? <span key={i} className="bg-yellow-200 text-blue-900 font-bold">{part}</span> : part
  );
}

export default function AdminDashboard() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Filter states
  const [filterUser, setFilterUser] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [search, setSearch] = useState('');
  const [viewFile, setViewFile] = useState(null); // { url, title, type }
  const [editComments, setEditComments] = useState({}); // { [docId]: comment }
  const [editTitle, setEditTitle] = useState({});
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDocs();
    // Simulate recent activity
    setRecentActivity([
      { type: 'upload', user: 'Alice', title: 'Report.pdf', time: '2m ago' },
      { type: 'comment', user: 'Bob', title: 'Notes.txt', time: '5m ago' },
      { type: 'download', user: 'Admin', title: 'Invoice.png', time: '10m ago' },
    ]);
  }, []);

  const fetchDocs = async (filters = {}) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Session expired. Please log in again.', { className: 'bg-red-50 text-red-800 font-semibold' });
        setLoading(false);
        return;
      }
      // Build query params
      const params = {};
      if (filters.user_name) params.user_name = filters.user_name;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.file_type) params.file_type = filters.file_type;
      if (filters.status) params.status = filters.status;
      const res = await axios.get('/api/admin/documents', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setDocs(res.data);
    } catch (err) {
      toast.error('Failed to fetch documents', { className: 'bg-red-50 text-red-800 font-semibold' });
    }
    setLoading(false);
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchDocs({
      user_name: filterUser,
      start_date: filterStart,
      end_date: filterEnd,
      file_type: filterType,
      status: filterStatus
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
        toast.error('Session expired. Please log in again.', { className: 'bg-red-50 text-red-800 font-semibold' });
        setLoading(false);
        return;
      }
      await axios.put(`/api/admin/documents/${docId}`, { is_viewed, admin_comment: editComments[docId] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Saved!', { className: 'bg-green-50 text-green-800 font-semibold' });
      fetchDocs({
        user_name: filterUser,
        start_date: filterStart,
        end_date: filterEnd,
        file_type: filterType,
        status: filterStatus
      });
    } catch (err) {
      toast.error('Update failed', { className: 'bg-red-50 text-red-800 font-semibold' });
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
      toast.error('Could not preview file', { className: 'bg-red-50 text-red-800 font-semibold' });
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
      toast.error('Could not download file', { className: 'bg-red-50 text-red-800 font-semibold' });
    }
    setLoading(false);
  };

  const handleDelete = (doc) => {
    setShowConfirm(true);
    setConfirmAction(() => async () => {
      setShowConfirm(false);
      setLoading(true);
      try {
        const token = getToken();
        await axios.delete(`/api/admin/documents/${doc.id}`, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Document deleted!', { className: 'bg-green-50 text-green-800 font-semibold' });
        fetchDocs();
      } catch (err) {
        toast.error('Delete failed', { className: 'bg-red-50 text-red-800 font-semibold' });
      }
      setLoading(false);
    });
  };

  // Summary calculations
  const totalDocs = docs.length;
  const today = new Date();
  const docsToday = docs.filter(doc => {
    const d = new Date(doc.upload_datetime);
    return d.toDateString() === today.toDateString();
  }).length;
  const reviewed = docs.filter(doc => doc.is_viewed).length;
  const pending = docs.filter(doc => !doc.is_viewed).length;

  // Search filter
  const filteredDocs = docs.filter(doc =>
    (doc.title.toLowerCase().includes(search.toLowerCase()) ||
      (doc.user_name && doc.user_name.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterType || (filterType === 'image' && doc.file_type && doc.file_type.startsWith('image')) ||
      (filterType === 'pdf' && doc.file_type === 'application/pdf') ||
      (filterType === 'audio' && doc.file_type && doc.file_type.startsWith('audio')) ||
      (filterType === 'video' && doc.file_type && doc.file_type.startsWith('video')) ||
      (filterType === 'text' && doc.file_type && doc.file_type.startsWith('text')) ||
      (filterType === 'zip' && doc.file_type && doc.file_type.includes('zip'))) &&
    (!filterStatus || (filterStatus === 'reviewed' && doc.is_viewed) || (filterStatus === 'pending' && !doc.is_viewed))
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 w-full">
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-blue-700">Admin Dashboard</h2>
              <a href="/admin/deadline" className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition">Set Deadline</a>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 rounded-xl p-4 shadow-card flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-700">{totalDocs}</span>
                <span className="text-xs text-blue-900 font-semibold">Total Documents</span>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 shadow-card flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-700">{docsToday}</span>
                <span className="text-xs text-blue-900 font-semibold">Uploaded Today</span>
              </div>
              <div className="bg-green-50 rounded-xl p-4 shadow-card flex flex-col items-center">
                <span className="text-2xl font-bold text-green-700">{reviewed}</span>
                <span className="text-xs text-green-900 font-semibold">Reviewed</span>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 shadow-card flex flex-col items-center">
                <span className="text-2xl font-bold text-yellow-700">{pending}</span>
                <span className="text-xs text-yellow-900 font-semibold">Pending</span>
              </div>
            </div>
            {/* Search Bar */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by title or user..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="p-2 border rounded focus:ring-2 focus:ring-blue-200 w-64"
              />
            </div>
            {/* Filter Controls */}
            <form className="flex flex-wrap gap-2 bg-white p-4 rounded-xl shadow border border-blue-100 mb-4" onSubmit={handleFilter}>
              <input type="text" placeholder="User Name" value={filterUser} onChange={e => setFilterUser(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200" />
              <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200" />
              <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200">
                <option value="">All Types</option>
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="text">Text</option>
                <option value="zip">Archive</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200">
                <option value="">All Status</option>
                <option value="reviewed">Reviewed</option>
                <option value="pending">Pending</option>
              </select>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition">Filter</button>
            </form>
            <div className="bg-white p-6 rounded-2xl shadow-2xl border border-blue-100">
              <h3 className="text-xl font-bold mb-4 text-blue-700">All Documents</h3>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-separate border-spacing-y-1">
                    <thead className="bg-blue-50 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 font-semibold">User</th>
                        <th className="p-2 font-semibold">Title</th>
                        <th className="p-2 font-semibold">Uploaded</th>
                        <th className="p-2 font-semibold">Viewed</th>
                        <th className="p-2 font-semibold">Comment</th>
                        <th className="p-2 font-semibold">File</th>
                        <th className="p-2 font-semibold">Status</th>
                        <th className="p-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map(doc => (
                        <tr key={doc.id} className="border-b last:border-0 hover:bg-blue-50/50 transition">
                          <td className="p-2">{doc.user_name}</td>
                          <td className="p-2">
                            {editingTitleId === doc.id ? (
                              <input
                                value={editTitle[doc.id] !== undefined ? editTitle[doc.id] : doc.title}
                                onChange={e => setEditTitle(prev => ({ ...prev, [doc.id]: e.target.value }))}
                                onBlur={() => { setEditingTitleId(null); handleSave(doc.id, doc.is_viewed, editTitle[doc.id]); }}
                                className="border p-1 rounded w-32 focus:ring-2 focus:ring-blue-200"
                                autoFocus
                              />
                            ) : (
                              <span onClick={() => setEditingTitleId(doc.id)} className="cursor-pointer hover:underline">{doc.title}</span>
                            )}
                          </td>
                          <td className="p-2">{timeAgo(doc.upload_datetime)}</td>
                          <td className="p-2">
                            <input type="checkbox" checked={doc.is_viewed} onChange={e => handleSave(doc.id, e.target.checked)} />
                          </td>
                          <td className="p-2">
                            <textarea
                              value={editComments[doc.id] !== undefined ? editComments[doc.id] : doc.admin_comment || ''}
                              onChange={e => setEditComments(prev => ({ ...prev, [doc.id]: e.target.value }))}
                              className="border p-1 rounded w-32 focus:ring-2 focus:ring-blue-200"
                            />
                          </td>
                          <td className="p-2 flex gap-2 items-center">
                            <button
                              type="button"
                              className="text-blue-500 underline"
                              title="Download document"
                              onClick={() => handleDownloadFile(doc)}
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              className="text-blue-600 underline hover:text-blue-800 font-medium"
                              title="View document"
                              onClick={() => handleViewFile(doc)}
                            >
                              View
                            </button>
                          </td>
                          <td className="p-2">
                            {doc.is_viewed ? <Badge color="reviewed">Reviewed</Badge> : <Badge color="pending">Pending</Badge>}
                          </td>
                          <td className="p-2">
                            <button
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                              title="Save comment/status"
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
                    ) : viewFile.type && (viewFile.type.startsWith('text') || viewFile.type === 'application/json' || viewFile.type === 'application/xml' || viewFile.type === 'text/csv') ? (
                      <iframe src={viewFile.url} title={viewFile.title} className="w-full h-full rounded border bg-white" frameBorder="0" />
                    ) : viewFile.type && viewFile.type.startsWith('audio') ? (
                      <audio controls src={viewFile.url} className="w-full" />
                    ) : viewFile.type && viewFile.type.startsWith('video') ? (
                      <video controls src={viewFile.url} className="max-h-full max-w-full rounded shadow bg-black" />
                    ) : (
                      <div className="text-gray-500 text-center">
                        <p>Preview not available for this file type.</p>
                        <a href={viewFile.url} download={viewFile.title} className="text-blue-600 underline mt-2 inline-block">Download file</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Confirmation Modal */}
            {showConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full relative animate-fadein">
                  <h3 className="text-lg font-bold mb-4 text-blue-700">Are you sure?</h3>
                  <p className="mb-6">This action cannot be undone.</p>
                  <div className="flex gap-4 justify-end">
                    <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                    <button onClick={confirmAction} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Confirm</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <BackToTopButton />
        </div>
        <aside className="bg-white rounded-xl shadow-card p-4 w-full md:w-64 h-fit sticky top-24">
          <h4 className="text-lg font-bold mb-2 text-blue-700">Recent Activity</h4>
          <ul className="space-y-2">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {a.type === 'upload' && <FaFileUpload className="text-blue-500" />} 
                {a.type === 'download' && <FaCloudDownloadAlt className="text-green-500" />} 
                {a.type === 'comment' && <FaCommentDots className="text-yellow-500" />} 
                <span className="font-semibold">{a.user}</span> {a.type} <span className="font-bold">{a.title}</span> <span className="text-gray-400 ml-auto">{a.time}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Layout>
  );
}
