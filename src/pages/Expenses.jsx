// 2. EXPENSES PAGE
// Create src/pages/Expenses.jsx

import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [categories, setCategories] = useState(['Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Personal', 'Education', 'Other']);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  useEffect(() => {
    // In a real app, fetch categories from user document
    fetchExpenses();
  }, [filter, dateRange]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      let expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        where('date', '>=', dateRange.startDate),
        where('date', '<=', dateRange.endDate),
        orderBy('date', 'desc')
      );
      
      if (filter !== 'all') {
        expensesQuery = query(
          collection(db, 'expenses'),
          where('userId', '==', userId),
          where('category', '==', filter),
          where('date', '>=', dateRange.startDate),
          where('date', '<=', dateRange.endDate),
          orderBy('date', 'desc')
        );
      }
      
      // This is simplified - in reality, you'd need to implement pagination
      // for large datasets and possibly use composite indexes in Firestore
      
      // For now, we'll use dummy data
      setExpenses([
        { id: '1', amount: 45.99, category: 'Food', description: 'Grocery shopping', date: '2025-05-10' },
        { id: '2', amount: 120.00, category: 'Housing', description: 'Electricity bill', date: '2025-05-08' },
        { id: '3', amount: 35.50, category: 'Transportation', description: 'Gas', date: '2025-05-05' },
        { id: '4', amount: 12.99, category: 'Entertainment', description: 'Movie tickets', date: '2025-05-01' },
        { id: '5', amount: 67.25, category: 'Food', description: 'Restaurant', date: '2025-04-29' },
      ]);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userId = auth.currentUser.uid;
      const newExpense = {
        ...formData,
        amount: parseFloat(formData.amount),
        userId,
        createdAt: new Date().toISOString()
      };
      
      // In a real app, you would add this to Firestore
      // await addDoc(collection(db, 'expenses'), newExpense);
      
      // For now, just update the local state
      setExpenses([
        {
          id: Math.random().toString(36).substr(2, 9),
          ...newExpense
        },
        ...expenses
      ]);
      
      // Reset form
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      // In a real app, you would delete from Firestore
      // await deleteDoc(doc(db, 'expenses', id));
      
      // For now, just update the local state
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Expense Tracker</h1>
      
      {/* Add Expense Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
              Amount ($)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary">
              Add Expense
            </button>
          </div>
        </form>
      </div>
      
      {/* Expense List */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold">Expense History</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Date Range Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="date"
                className="px-2 py-1 border border-gray-300 rounded-md"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
              <span>to</span>
              <input
                type="date"
                className="px-2 py-1 border border-gray-300 rounded-md"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
            
            {/* Category Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No expenses found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleDelete(expense.id)}
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
    </div>
  );
};

export default Expenses;