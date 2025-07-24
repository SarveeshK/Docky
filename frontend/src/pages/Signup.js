import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { useLoading } from '../components/LoadingContext';

export default function Signup() {
  const { setLoading } = useLoading();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inputFocus, setInputFocus] = useState({ name: false, email: false, password: false });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/signup', { name, email, password, user_type: userType });
      setLoading(false);
      toast.success('Signup successful! You can login now.', { className: 'bg-green-50 text-green-800 font-semibold' });
      setTimeout(() => window.location.href = '/', 1200);
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.error || 'Signup failed';
      toast.error(errorMsg, { className: 'bg-red-50 text-red-800 font-semibold' });
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <form className="bg-white p-10 rounded-2xl shadow-2xl w-96 flex flex-col gap-6 border border-blue-100" onSubmit={handleSignup}>
          <h2 className="text-3xl font-extrabold mb-2 text-blue-700 text-center tracking-tight">Create your Docky account</h2>
          <div className="relative w-full">
            <FaUser className={`absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 ${inputFocus.name ? 'text-blue-600' : ''}`} />
            <input
              type="text"
              placeholder=" "
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setInputFocus(f => ({ ...f, name: true }))}
              onBlur={() => setInputFocus(f => ({ ...f, name: false }))}
              className="w-full p-2 pl-10 border rounded focus:ring-2 focus:ring-blue-200 peer"
              required
            />
            <label className={`absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-200
              ${name ? '-top-4 text-xs text-blue-600' : 'peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-600 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400'}`}>Name</label>
          </div>
          <div className="relative w-full">
            <FaEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 ${inputFocus.email ? 'text-blue-600' : ''}`} />
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setInputFocus(f => ({ ...f, email: true }))}
              onBlur={() => setInputFocus(f => ({ ...f, email: false }))}
              className="w-full p-2 pl-10 border rounded focus:ring-2 focus:ring-blue-200 peer"
              required
            />
            <label className={`absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-200
              ${email ? '-top-4 text-xs text-blue-600' : 'peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-600 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400'}`}>Email</label>
          </div>
          <div className="relative w-full">
            <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 ${inputFocus.password ? 'text-blue-600' : ''}`} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setInputFocus(f => ({ ...f, password: true }))}
              onBlur={() => setInputFocus(f => ({ ...f, password: false }))}
              className="w-full p-2 pl-10 border rounded focus:ring-2 focus:ring-blue-200 pr-10 peer"
              required
            />
            <label className={`absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-200
              ${password ? '-top-4 text-xs text-blue-600' : 'peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-600 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400'}`}>Password</label>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 focus:outline-none"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition shadow-card">Sign Up</button>
          <div className="mt-2 text-center">
            <a href="/" className="text-blue-500 hover:underline">Login</a>
          </div>
        </form>
      </div>
    </Layout>
  );
}
