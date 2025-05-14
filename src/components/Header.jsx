import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-6">
      <div className="flex-1"></div>
      <div className="flex items-center space-x-4">
        <div className="text-sm">
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