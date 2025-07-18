import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">{children}</main>
      <footer className="text-center text-gray-400 py-4 text-sm">© {new Date().getFullYear()} Docky. All rights reserved.</footer>
    </div>
  );
} 