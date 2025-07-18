import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/signup', { name, email, password, user_type: userType });
      toast.success('Signup successful! You can login now.');
      setError('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
      setSuccess('');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <form className="bg-white p-10 rounded-2xl shadow-xl w-96 flex flex-col gap-4 border border-blue-100" onSubmit={handleSignup}>
          <h2 className="text-3xl font-extrabold mb-2 text-blue-700 text-center tracking-tight">Create your Docky account</h2>
          <select value={userType} onChange={e => setUserType(e.target.value)} className="mb-2 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200" disabled>
            <option value="user">User</option>
          </select>
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200" required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200" required />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition">Sign Up</button>
          <div className="mt-2 text-center">
            <a href="/" className="text-blue-500 hover:underline">Login</a>
          </div>
        </form>
      </div>
    </Layout>
  );
}
