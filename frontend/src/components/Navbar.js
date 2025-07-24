import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur shadow-md border-b border-blue-100">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {/* Placeholder logo: a blue document icon */}
          <span className="inline-block w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-card">
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect width="16" height="20" x="2" y="0" rx="3" fill="#2563eb"/><rect width="12" height="2" x="4" y="4" rx="1" fill="#fff"/><rect width="8" height="2" x="4" y="8" rx="1" fill="#fff"/><rect width="10" height="2" x="4" y="12" rx="1" fill="#fff"/></svg>
          </span>
          <span className="text-xl font-bold text-primary">Docky</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-blue-700 hover:text-primary font-medium transition">Home</Link>
          <Link to="/user" className="text-blue-700 hover:text-primary font-medium transition">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
} 