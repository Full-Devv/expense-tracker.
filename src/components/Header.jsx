import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';

const Header = ({ onMenuClick }) => {
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      setUser(auth.currentUser);
    }, []);
  
    return (
      <header className="bg-white shadow-sm h-16 flex items-center px-4">
        {/* Menu button - visible only on mobile */}
        <button 
          className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
          onClick={onMenuClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <div className="text-sm hidden sm:block">
            {user && <p className="text-gray-700">{user.email}</p>}
          </div>
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
            {user && user.email.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>
    );
  };
export default Header;