import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'; // Added missing imports
import { auth, db } from '../firebase/firebase';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password match - keep validation at the top
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    // Validate password strength
    if (password.length < 6) {
      return setError('Password should be at least 6 characters');
    }

    setLoading(true);

    try {
      // Check if this is the first user (will be admin)
      const usersCollectionRef = collection(db, 'users');
      const usersQuery = await getDocs(usersCollectionRef);
      const isFirstUser = usersQuery.empty;

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, {
        displayName: name
      });

      // Create user document in Firestore with role - ONLY DO THIS ONCE
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role: isFirstUser ? 'admin' : 'user', // First user gets admin role
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        // Default categories for the user
        expenseCategories: ['Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Personal', 'Education', 'Other'],
        incomeCategories: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other']
      });

      // Navigate to dashboard after successful registration
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setError('Failed to create account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autocomplete="new-password"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autocomplete="new-password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p>Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;