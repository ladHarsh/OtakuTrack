import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSun, FaMoon, FaSearch, FaUser, FaSignOutAlt, FaCog, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import showApi from '../api/showApi';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isSystemTheme, resetToSystemTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Search shows
  const { refetch: searchShows } = useQuery(
    ['search', searchQuery],
    () => showApi.searchShows(searchQuery, { limit: 5 }),
    {
      enabled: false,
      onSuccess: (data) => {
        setSearchResults(data.data || []);
      },
      onError: () => {
        toast.error('Search failed');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 2) {
      searchShows();
    } else {
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-gradient">OtakuTrack</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
              >
                Home
              </Link>
              
              {isAuthenticated && (
                <Link
                  to="/watchlist"
                  className={`nav-link ${isActive('/watchlist') ? 'nav-link-active' : ''}`}
                >
                  Watchlist
                </Link>
              )}
              
              <Link
                to="/clubs"
                className={`nav-link ${isActive('/clubs') ? 'nav-link-active' : ''}`}
              >
                Clubs
              </Link>
              
              {isAuthenticated && (
                <Link
                  to="/analytics"
                  className={`nav-link ${isActive('/analytics') ? 'nav-link-active' : ''}`}
                >
                  Analytics
                </Link>
              )}
              
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`nav-link ${isActive('/admin') ? 'nav-link-active' : ''}`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="flex">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search shows..."
                    value={searchQuery}
                    onChange={handleSearchInput}
                    onFocus={() => setShowSearch(true)}
                    className="form-input pr-10 w-64"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FaSearch />
                  </button>
                </div>
              </form>
              
              {/* Search Results Dropdown */}
              {showSearch && searchResults.length > 0 && (
                <div className="absolute w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-strong mt-1 max-h-80 overflow-y-auto z-50">
                  {searchResults.map((show) => (
                    <div
                      key={show._id}
                      className="p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => {
                        navigate(`/shows/${show._id}`);
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <img 
                          src={show.poster} 
                          alt={show.title}
                          className="w-10 h-15 object-cover rounded"
                        />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{show.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{show.type} • {show.year}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <>
                  <FaMoon className="text-gray-600 dark:text-gray-400" />
                  <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">Dark</span>
                </>
              ) : (
                <>
                  <FaSun className="text-gray-600 dark:text-gray-400" />
                  <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">Light</span>
                </>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors duration-200">
                  <FaUser />
                  <span>{user?.name}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-strong border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <FaCog className="mr-3" />
                      Profile
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <FaSignOutAlt className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden" ref={mobileMenuRef}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search shows..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  className="form-input flex-1"
                />
                <button
                  type="submit"
                  className="ml-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  <FaSearch />
                </button>
              </form>
            </div>

            {/* Mobile Menu Items */}
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') ? 'nav-link-active' : 'nav-link'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            {isAuthenticated && (
              <Link
                to="/watchlist"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/watchlist') ? 'nav-link-active' : 'nav-link'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Watchlist
              </Link>
            )}
            
            <Link
              to="/clubs"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/clubs') ? 'nav-link-active' : 'nav-link'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Clubs
            </Link>
            
            {isAuthenticated && (
              <Link
                to="/analytics"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/analytics') ? 'nav-link-active' : 'nav-link'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </Link>
            )}
            
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin') ? 'nav-link-active' : 'nav-link'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}

            {/* Mobile Theme Toggle */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                Current Theme: {theme === 'light' ? 'Light' : 'Dark'}
                {isSystemTheme && ' (System)'}
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium nav-link"
              >
                {theme === 'light' ? (
                  <>
                    <FaMoon className="mr-3" />
                    Switch to Dark Mode
                  </>
                ) : (
                  <>
                    <FaSun className="mr-3" />
                    Switch to Light Mode
                  </>
                )}
              </button>
              {!isSystemTheme && (
                <button
                  onClick={resetToSystemTheme}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium nav-link"
                >
                  <FaCog className="mr-3" />
                  Use System Theme
                </button>
              )}
            </div>

            {/* Mobile User Menu */}
            {isAuthenticated ? (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  Signed in as {user?.name}
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium nav-link"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium btn-outline text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium btn-primary text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;
