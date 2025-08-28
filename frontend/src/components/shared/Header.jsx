import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../../stores/authStore';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from "../ui/avatar";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully. See you next time!');
    setIsDropdownOpen(false);
    navigate('/');
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="relative p-4 flex-shrink-0">
      <Link to="/" className="text-white md:text-3xl text-xl font-bold tracking-wide hover:text-gray-300 transition-colors">
        INTERVIEW BUDDY
      </Link>
      <div className="absolute top-4 right-6 z-30 flex items-center space-x-4">
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 h-auto cursor-pointer"
            >
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-white/20 text-white text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block">{user?.username}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-white/80 border-b border-white/20">
                    {user?.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 md:space-x-3">
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              size="sm"
              className="hover:text-white text-white hover:bg-white/10 border border-white/20 text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 cursor-pointer"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 cursor-pointer"
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
