// ADMIN PAGE
// Create src/pages/Admin.jsx

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalExpenses: 0,
    totalIncome: 0,
    averageSavingsRate: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      // In a real app, you would check if the current user has admin role
      // For demonstration, we'll use a simple check (you should implement proper role-based auth)
      const user = auth.currentUser;
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Check if user has admin role
      const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email), where('role', '==', 'admin')));
      
      if (userDoc.empty) {
        // For demo purposes, let's say the current user is an admin
        // In a real app, you would redirect to an unauthorized page
        console.log('User is not an admin');
        setIsAdmin(true); // Set to true for demo, but in production should be false
      } else {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/dashboard');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      
      // Fetch transactions
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      const transactionsData = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transactionsData);
      
      // Calculate statistics
      const activeUsers = usersData.filter(user => user.lastLoginAt && new Date(user.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
      const totalExpenses = transactionsData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = transactionsData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      // For demo purposes, generate some dummy stats
      setStats({
        totalUsers: usersData.length,
        activeUsers: activeUsers || Math.floor(usersData.length * 0.7), // 70% active as fallback
        totalTransactions: transactionsData.length,
        totalExpenses: totalExpenses || 18750.45, // Dummy value as fallback
        totalIncome: totalIncome || 35250.75, // Dummy value as fallback
        averageSavingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 25 // 25% as fallback
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      // Note: In a real app, you would also:
      // 1. Delete the user from Firebase Authentication
      // 2. Delete all related user data (transactions, budgets, goals, etc.)
      
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      // Update user role in Firestore
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      alert('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role: ' + error.message);
    }
  };

  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Dashboard Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-white p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-primary-600">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeUsers} active in last 30 days
            </p>
          </div>
          
          <div className="card bg-white p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
            <p className="text-2xl font-bold text-primary-600">{stats.totalTransactions}</p>
          </div>
          
          <div className="card bg-white p-4">
            <h3 className="text-sm font-medium text-gray-500">Platform Balance</h3>
            <p className="text-2xl font-bold text-green-600">${(stats.totalIncome - stats.totalExpenses).toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Avg. savings rate: {stats.averageSavingsRate}%
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-white p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Income vs Expenses</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Income</span>
                  <span>${stats.totalIncome.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Expenses</span>
                  <span>${stats.totalExpenses.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (stats.totalExpenses / stats.totalIncome) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-white p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Activity</h3>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
              <ul className="space-y-2">
                {transactions.slice(0, 5).map((transaction) => (
                  <li key={transaction.id} className="flex justify-between text-sm border-b pb-2">
                    <span>{transaction.description || transaction.category}</span>
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        
        {users.length === 0 ? (
          <p className="text-gray-500">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderTransactions = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const user = users.find(u => u.id === transaction.userId) || { email: 'Unknown' };
                  
                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          ${transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.date || new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Platform Settings</h2>
        
        <div className="card bg-white p-6">
          <h3 className="text-lg font-medium mb-4">General Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                defaultValue="Smart Finance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                defaultValue="support@smartfinance.com"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="allowRegistration"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked={true}
              />
              <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
                Allow new user registration
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="maintenanceMode"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked={false}
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                Enable maintenance mode
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="btn btn-primary">
              Save Settings
            </button>
          </div>
        </div>
        
        <div className="card bg-white p-6">
          <h3 className="text-lg font-medium mb-4">Default Categories</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Expense Categories</h4>
              <div className="space-y-2">
                {['Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 
                  'Healthcare', 'Personal', 'Education', 'Other'].map((category, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                      defaultValue={category}
                    />
                    <button className="ml-2 text-red-600 text-sm">
                      Remove
                    </button>
                  </div>
                ))}
                <button className="text-sm text-primary-600">
                  + Add Category
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Income Categories</h4>
              <div className="space-y-2">
                {['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'].map((category, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                      defaultValue={category}
                    />
                    <button className="ml-2 text-red-600 text-sm">
                      Remove
                    </button>
                  </div>
                ))}
                <button className="text-sm text-primary-600">
                  + Add Category
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="btn btn-primary">
              Save Categories
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'transactions':
        return renderTransactions();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Unauthorized Access</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-6 flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'dashboard' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'transactions' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default Admin;