import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState(location.state && location.state.admin ? 'admin' : 'user');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password, user_type: userType });

      // Check if the response and data exist, and if a token is present
      if (res && res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_type', res.data.user_type);
      localStorage.setItem('name', res.data.name);
      window.location.href = res.data.user_type === 'admin' ? '/admin' : '/user';
      } else {
        // If there's no token, show a detailed error
        const detailedError = `Login failed. Backend sent a successful response, but it did not contain a token. Response data: ${JSON.stringify(res.data)}`;
        toast.error('Login Failed: No Token');
        alert(detailedError); // Use a prominent alert for debugging
      }
    } catch (err) {
      // This block runs if the backend returns an error status (like 401, 404, 500)
      const errorResponse = err.response ? JSON.stringify(err.response.data) : 'No response from server.';
      const detailedError = `An error occurred. Status: ${err.response?.status}. Response: ${errorResponse}`;
      toast.error('An error occurred');
      alert(detailedError); // Use a prominent alert for debugging
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        {/* --- DEBUG: SHOW API URL --- */}
        <div style={{ position: 'absolute', top: '80px', backgroundColor: 'yellow', padding: '10px', border: '1px solid black', zIndex: 1000 }}>
            <strong>API URL Used:</strong> {process.env.REACT_APP_API_URL || "NOT SET"}
        </div>
        {/* --- END DEBUG --- */}

        <form className="bg-white p-10 rounded-2xl shadow-xl w-96 flex flex-col gap-4 border border-blue-100" onSubmit={handleLogin}>
          <h2 className="text-3xl font-extrabold mb-4 text-blue-700 text-center tracking-tight">Sign in to Docky</h2>
          {/* Toggle Button Group */}
          <div className="flex justify-center mb-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-l font-semibold border border-blue-500 focus:outline-none transition ${userType === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-blue-700'}`}
              onClick={() => setUserType('user')}
            >
              User
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-r font-semibold border border-blue-500 border-l-0 focus:outline-none transition ${userType === 'admin' ? 'bg-blue-500 text-white' : 'bg-white text-blue-700'}`}
              onClick={() => setUserType('admin')}
            >
              Admin
            </button>
          </div>
          {/* Login Fields */}
          <input
            type="email"
            placeholder={userType === 'admin' ? 'Admin Email' : 'Email'}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            required
          />
          <input
            type="password"
            placeholder={userType === 'admin' ? 'Admin Password' : 'Password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
            required
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition">Login</button>
          {userType === 'user' && (
            <div className="mt-2 text-center">
              <a href="/signup" className="text-blue-500 hover:underline">Sign up</a>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
