import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

export default function UserDashboard() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocs();
    fetchDeadline();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Session expired. Please log in again.');
        setLoading(false);
        return;
      }
      const res = await axios.get('/api/documents/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs(res.data);
    } catch (err) {
      toast.error('Failed to fetch documents');
    }
    setLoading(false);
  };

  const fetchDeadline = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get('/api/settings/deadline', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeadline(res.data.deadline_datetime);
    } catch {}
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Session expired. Please log in again.');
        setLoading(false);
        return;
      }
      await axios.post('/api/documents/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Upload successful!');
      setTitle('');
      setDescription('');
      setFile(null);
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl shadow flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-700">Submission Deadline:</span>
          <span className="text-base font-medium text-blue-900">{deadline ? new Date(deadline).toLocaleString() : 'Not set'}</span>
        </div>
        <form className="bg-white p-6 rounded-xl shadow-lg mb-6 flex flex-col gap-3 border border-blue-100 max-w-xl mx-auto" onSubmit={handleUpload}>
          <h2 className="text-xl font-bold mb-2 text-blue-700">Upload Document</h2>
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200" required />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200" />
          <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full" required />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold transition" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
        </form>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
          <h2 className="text-xl font-bold mb-4 text-blue-700">My Documents</h2>
          {loading ? <div>Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="p-2 font-semibold">Title</th>
                    <th className="p-2 font-semibold">Uploaded</th>
                    <th className="p-2 font-semibold">Viewed</th>
                    <th className="p-2 font-semibold">Comment</th>
                    <th className="p-2 font-semibold">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map(doc => (
                    <tr key={doc.id} className="border-b last:border-0 hover:bg-blue-50/50">
                      <td className="p-2">{doc.title}</td>
                      <td className="p-2">{new Date(doc.upload_datetime).toLocaleString()}</td>
                      <td className="p-2">{doc.is_viewed ? 'Yes' : 'No'}</td>
                      <td className="p-2">{doc.admin_comment || '-'}</td>
                      <td className="p-2">
                        <a href={`/api/documents/download/${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Download</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
