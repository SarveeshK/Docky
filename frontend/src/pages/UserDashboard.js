import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { FaFileUpload, FaFileAlt, FaCommentDots, FaCheckCircle, FaTimesCircle, FaCloudDownloadAlt, FaLock, FaFile, FaRegClock, FaFileImage, FaFilePdf, FaFileAudio, FaFileVideo, FaFileArchive } from 'react-icons/fa';

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

export default function UserDashboard() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState({ title: false, description: false });
  const [viewFile, setViewFile] = useState(null); // { url, title, type }
  const [uploadProgress, setUploadProgress] = useState({}); // { filename: percent }
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  useEffect(() => {
    fetchDocs();
    fetchDeadline();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Session expired. Please log in again.', { className: 'bg-red-50 text-red-800 font-semibold' });
        setLoading(false);
        return;
      }
      const res = await axios.get('/api/documents/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs(res.data);
    } catch (err) {
      toast.error('Failed to fetch documents', { className: 'bg-red-50 text-red-800 font-semibold' });
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
    const files = Array.from(e.target.file.files);
    let allSuccess = true;
    for (const f of files) {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', f);
      try {
        const token = getToken();
        if (!token) {
          toast.error('Session expired. Please log in again.', { className: 'bg-red-50 text-red-800 font-semibold' });
          setLoading(false);
          return;
        }
        await axios.post('/api/documents/upload', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [f.name]: percent }));
          }
        });
        setUploadProgress(prev => ({ ...prev, [f.name]: 100 }));
        toast.success(`Uploaded ${f.name}!`, { className: 'bg-green-50 text-green-800 font-semibold' });
      } catch (err) {
        allSuccess = false;
        toast.error(`Failed to upload ${f.name}`, { className: 'bg-red-50 text-red-800 font-semibold' });
      }
    }
    setTitle('');
    setDescription('');
    setFile(null);
    fetchDocs();
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

  function highlightMatch(text, search) {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? <span key={i} className="bg-yellow-200 text-blue-900 font-bold">{part}</span> : part
    );
  }

  const filteredDocs = docs.filter(doc =>
    (doc.title.toLowerCase().includes(search.toLowerCase())) &&
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
      <div className="space-y-8">
        <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl shadow flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-700 flex items-center gap-2"><FaRegClock className="inline-block mr-1" /> Submission Deadline:</span>
          <span className="text-base font-medium text-blue-900">{deadline ? new Date(deadline).toLocaleString() : 'Not set'}</span>
        </div>
        <form className="bg-white p-6 rounded-2xl shadow-2xl mb-6 flex flex-col gap-4 border border-blue-100 max-w-xl mx-auto" onSubmit={handleUpload}>
          <h2 className="text-xl font-bold mb-2 text-blue-700 flex items-center gap-2"><FaFileUpload /> Upload Document</h2>
          <div className="relative w-full">
            <FaFileAlt className={`absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 ${inputFocus.title ? 'text-blue-600' : ''}`} />
            <input
              type="text"
              placeholder=" "
              value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={() => setInputFocus(f => ({ ...f, title: true }))}
              onBlur={() => setInputFocus(f => ({ ...f, title: false }))}
              className="w-full p-2 pl-10 border rounded focus:ring-2 focus:ring-blue-200 peer"
              required
            />
            <label className={`absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-200
              ${title ? '-top-4 text-xs text-blue-600' : 'peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-600 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400'}`}>Title</label>
          </div>
          <div className="relative w-full">
            <FaCommentDots className={`absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 ${inputFocus.description ? 'text-blue-600' : ''}`} />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onFocus={() => setInputFocus(f => ({ ...f, description: true }))}
              onBlur={() => setInputFocus(f => ({ ...f, description: false }))}
              className="w-full p-2 pl-10 border rounded focus:ring-2 focus:ring-blue-200 min-h-[60px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <FaFile className="text-blue-400" />
              <input type="file" name="file" multiple onChange={e => setFile(e.target.files)} className="w-full" required />
            </label>
            {file && Array.from(file).map(f => (
              <div key={f.name} className="text-xs text-blue-700 font-medium flex items-center gap-2">
                {f.name}
                {uploadProgress[f.name] && (
                  <div className="w-24 h-2 bg-blue-100 rounded overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${uploadProgress[f.name]}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold transition shadow-card flex items-center gap-2" disabled={loading}>
            {loading ? <Spinner /> : <><FaFileUpload /> Upload</>}
          </button>
        </form>
        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-blue-100">
          <h2 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2"><FaCloudDownloadAlt /> My Documents</h2>
          <div className="flex items-center gap-4 mb-4">
            <input type="text" placeholder="Search by title..." value={search} onChange={e => setSearch(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-200 w-64" />
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
          </div>
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
                    <th className="p-2 font-semibold">Title</th>
                    <th className="p-2 font-semibold">Uploaded</th>
                    <th className="p-2 font-semibold">Viewed</th>
                    <th className="p-2 font-semibold">Comment</th>
                    <th className="p-2 font-semibold">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map(doc => (
                    <tr key={doc.id} className="border-b last:border-0 hover:bg-blue-50/50 transition">
                      <td className="p-2">
                        {doc.file_type && doc.file_type.startsWith('image') ? (
                          <img src={`/api/documents/view/${doc.id}`} alt={doc.title} className="w-10 h-10 object-cover rounded shadow" />
                        ) : doc.file_type === 'application/pdf' ? (
                          <FaFilePdf className="text-red-500 text-xl" />
                        ) : doc.file_type && doc.file_type.startsWith('audio') ? (
                          <FaFileAudio className="text-blue-500 text-xl" />
                        ) : doc.file_type && doc.file_type.startsWith('video') ? (
                          <FaFileVideo className="text-purple-500 text-xl" />
                        ) : doc.file_type && doc.file_type.startsWith('text') ? (
                          <FaFileAlt className="text-gray-500 text-xl" />
                        ) : doc.file_type && doc.file_type.includes('zip') ? (
                          <FaFileArchive className="text-yellow-500 text-xl" />
                        ) : (
                          <FaFile className="text-gray-400 text-xl" />
                        )}
                      </td>
                      <td className="p-2">{new Date(doc.upload_datetime).toLocaleString()}</td>
                      <td className="p-2">
                        {doc.is_viewed ? <Badge color="reviewed"><FaCheckCircle className="inline-block mr-1" /> Yes</Badge> : <Badge color="pending"><FaRegClock className="inline-block mr-1" /> No</Badge>}
                      </td>
                      <td className="p-2">{doc.admin_comment || '-'}</td>
                      <td className="p-2">
                        <a href={`/api/documents/download/${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline flex items-center gap-1"><FaCloudDownloadAlt /> Download</a>
                        <button type="button" className="ml-2 text-blue-600 underline hover:text-blue-800 font-medium" title="View document" onClick={() => handleViewFile(doc)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
    </Layout>
  );
}
