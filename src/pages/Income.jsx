// 3. INCOME PAGE
// Create src/pages/Income.jsx

import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: 'monthly' // monthly, bi-weekly, weekly, annual
  });
  const [categories, setCategories] = useState(['Salary', 'Freelance', 'Investments', 'Gifts', 'Other']);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  useEffect(() => {
    // In a real app, fetch categories from user document
    fetchIncomes();
  }, [filter, dateRange]);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      // For now, just use dummy data
      setIncomes([
        { id: '1', amount: 2500.00, category: 'Salary', description: 'Monthly salary', date: '2025-05-01', isRecurring: true, frequency: 'monthly' },
        { id: '2', amount: 350.00, category: 'Freelance', description: 'Logo design project', date: '2025-05-07', isRecurring: false },
        { id: '3', amount: 65.32, category: 'Investments', description: 'Dividend payment', date: '2025-04-28', isRecurring: true, frequency: 'quarterly' },
        { id: '4', amount: 100.00, category: 'Gifts', description: 'Birthday gift', date: '2025-04-25', isRecurring: false },
      ]);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userId = auth.currentUser.uid;
      const newIncome = {
        ...formData,
        amount: parseFloat(formData.amount),
        userId,
        createdAt: new Date().toISOString()
      };
      
      // In a real app, you would add this to Firestore
      // await addDoc(collection(db, 'incomes'), newIncome);
      
      // For now, just update the local state
      setIncomes([
        {
          id: Math.random().toString(36).substr(2, 9),
          ...newIncome
        },
        ...incomes
      ]);
      
      // Reset form
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        frequency: 'monthly'
      });
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      // In a real app, you would delete from Firestore
      // await deleteDoc(doc(db, 'incomes', id));
      
      // For now, just update the local state
      setIncomes(incomes.filter(income => income.id !== id));
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const totalIncome = incomes.reduce((total, income) => total + income.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Income Tracker</h1>
      
      {/* Income Summary */}
      <div className="card bg-white">
        <h3 className="text-lg font-medium text-gray-700">Total Income</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">${totalIncome.toFixed(2)}</p>
      </div>
      
      {/* Add Income Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Add New Income</h2>
        
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
          
          <div className="flex items-center space-x-2">
            <input
              id="isRecurring"
              name="isRecurring"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.isRecurring}
              onChange={handleInputChange}
            />
            <label className="text-gray-700 text-sm font-bold" htmlFor="isRecurring">
              Recurring Income
            </label>
          </div>
          
          {formData.isRecurring && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="frequency">
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.frequency}
                onChange={handleInputChange}
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          )}
          
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary">
              Add Income
            </button>
          </div>
        </form>
      </div>
      
      {/* Income List */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold">Income History</h2>
          
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
        ) : incomes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No income found for the selected filters.
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomes.map((income) => (
                  <tr key={income.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {income.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {income.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {income.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${income.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {income.isRecurring ? `Yes (${income.frequency})` : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleDelete(income.id)}
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

export default Income;