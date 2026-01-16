import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';


// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watchlist from './pages/Watchlist';
import ShowDetails from './pages/ShowDetails';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import ClubEdit from './pages/ClubEdit';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
          <Navbar />
          <Routes>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/watchlist" element={<PrivateRoute><Watchlist /></PrivateRoute>} />
            <Route path="/shows/:id" element={<PrivateRoute><ShowDetails /></PrivateRoute>} />
            <Route path="/clubs" element={<PrivateRoute><Clubs /></PrivateRoute>} />
            <Route path="/clubs/:id" element={<PrivateRoute><ClubDetail /></PrivateRoute>} />
            <Route path="/clubs/:id/edit" element={<PrivateRoute><ClubEdit /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
