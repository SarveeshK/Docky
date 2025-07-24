import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-extrabold text-blue-700 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-blue-900 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-6">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition">Go to Home</Link>
    </div>
  );
} 