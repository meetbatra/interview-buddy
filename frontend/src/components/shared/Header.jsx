import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { Button } from '../ui/button';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <>
      <header className="relative p-4 flex-shrink-0">
        <Link to="/" className="text-white md:text-3xl text-xl font-bold tracking-wide hover:text-gray-300 transition-colors">
          INTERVIEW BUDDY
        </Link>
        <div className="absolute top-4 right-6 flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative">
              <Button
                onClick={() => setShowUserMenu(!showUserMenu)}
                variant="ghost"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 h-auto cursor-pointer"
              >
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block">{user?.username}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              
              {showUserMenu && (
                <div className="absolute right-0 z-30 mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-white/80 border-b border-white/20">
                      {user?.email}
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start text-left px-4 py-2 text-sm text-white hover:bg-white/10 hover:text-white rounded-none border-0 cursor-pointer"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 md:space-x-3">
                <>
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
                </>
            </div>
          )}
        </div>
      </header>

      {/* Close user menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;
