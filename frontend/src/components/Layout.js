import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 transition-opacity duration-500 animate-fadein">
        {children}
      </main>
      <footer className="text-center text-gray-400 py-6 text-sm">
        &copy; {new Date().getFullYear()} Docky. All rights reserved.
      </footer>
    </div>
  );
} 