import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function Navbar() {
  const location = useLocation();
  const isLogin = location.pathname === '/';
  const isSignup = location.pathname === '/signup';
  const isAdminDashboard = location.pathname.startsWith('/admin');

  // Hide nav links on login and signup pages
  const showNavLinks = !(isLogin || isSignup);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const name = localStorage.getItem('name');
  const userType = localStorage.getItem('user_type');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Remove all dark mode state, useEffect, and toggle button code

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur shadow-md py-3 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-blue-700 tracking-tight">Docky</span>
      </div>
      <div className="flex items-center gap-4">
        {showNavLinks && (
          <div className="flex items-center gap-6">
            <Link to="/" className="text-blue-700 hover:text-primary font-medium transition">Home</Link>
            {!isAdminDashboard && (
              <Link to="/user" className="text-blue-700 hover:text-primary font-medium transition">Dashboard</Link>
            )}
          </div>
        )}
        {name && (
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1 rounded hover:bg-blue-100 transition font-semibold text-blue-700 border border-blue-100"
              onClick={() => setDropdownOpen(v => !v)}
            >
              <span className="rounded-full bg-blue-200 text-blue-700 px-2 py-1 text-sm font-bold uppercase">{name[0]}</span>
              <span className="hidden sm:inline">{name}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-blue-100 rounded shadow-lg py-2 z-50 animate-fadein">
                <a
                  href={userType === 'admin' ? '/admin' : '/user'}
                  className="block px-4 py-2 text-blue-700 hover:bg-blue-50 transition"
                >
                  Dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full relative animate-fadein">
            <h3 className="text-lg font-bold mb-4 text-blue-700">Log out?</h3>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={confirmLogout} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Log out</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 