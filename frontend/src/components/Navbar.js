import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = localStorage.getItem('user_type');
  const name = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Hide Login/Sign Up links if already on those pages
  const isLogin = location.pathname === '/';
  const isSignup = location.pathname === '/signup';

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-600 tracking-tight">Docky</span>
            {userType && (
              <span className="ml-4 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold uppercase">
                {userType} {name && <span className="capitalize">({name})</span>}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {userType === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
                <Link to="/admin/deadline" className="text-gray-700 hover:text-blue-600 font-medium">Set Deadline</Link>
              </>
            )}
            {userType === 'user' && (
              <Link to="/user" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
            )}
            {userType && (
              <button onClick={handleLogout} className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition">Logout</button>
            )}
            {!userType && !isLogin && !isSignup && (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Login</Link>
                <Link to="/signup" className="text-gray-700 hover:text-blue-600 font-medium">Sign Up</Link>
                <button onClick={() => navigate('/', { state: { admin: true } })} className="text-gray-700 hover:text-blue-600 font-medium">Admin Login</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 