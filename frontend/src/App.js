import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SetDeadline from './pages/SetDeadline';
import NotFound from './pages/NotFound';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { LoadingProvider } from './components/LoadingContext';

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

function App() {
  return (
    <LoadingProvider>
      <Router>
        <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/deadline" element={<SetDeadline />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </LoadingProvider>
  );
}

export default App;
