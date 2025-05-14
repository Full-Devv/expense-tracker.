// BUDGET PAGE
// Create src/pages/Budget.jsx

import { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const Budget = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [budgetData, setBudgetData] = useState({});
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchBudgetData();
  }, [currentMonth]);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from Firestore
      // For now, use dummy data
      const dummyCategories = [
        'Food', 'Housing', 'Transportation', 'Utilities', 
        'Entertainment', 'Healthcare', 'Personal', 'Education'
      ];
      
      const dummyBudgetData = {
        'Food': { budgeted: 500, spent: 320.45 },
        'Housing': { budgeted: 1200, spent: 1200 },
        'Transportation': { budgeted: 300, spent: 245.75 },
        'Utilities': { budgeted: 200, spent: 187.23 },
        'Entertainment': { budgeted: 150, spent: 95.50 },
        'Healthcare': { budgeted: 100, spent: 0 },
        'Personal': { budgeted: 200, spent: 142.80 },
        'Education': { budgeted: 100, spent: 50 }
      };
      
      setCategories(dummyCategories);
      setBudgetData(dummyBudgetData);
      
      const total = Object.values(dummyBudgetData).reduce((acc, { budgeted }) => acc + budgeted, 0);
      const spent = Object.values(dummyBudgetData).reduce((acc, { spent }) => acc + spent, 0);
      
      setTotalBudget(total);
      setTotalSpent(spent);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory || !newAmount || parseFloat(newAmount) <= 0) {
      return;
    }
    
    // Check if category already exists
    if (categories.includes(newCategory)) {
      // Update existing category
      const updatedBudgetData = {
        ...budgetData,
        [newCategory]: {
          ...budgetData[newCategory],
          budgeted: parseFloat(newAmount)
        }
      };
      
      setBudgetData(updatedBudgetData);
      setTotalBudget(totalBudget - budgetData[newCategory].budgeted + parseFloat(newAmount));
    } else {
      // Add new category
      const updatedCategories = [...categories, newCategory];
      const updatedBudgetData = {
        ...budgetData,
        [newCategory]: {
          budgeted: parseFloat(newAmount),
          spent: 0
        }
      };
      
      setCategories(updatedCategories);
      setBudgetData(updatedBudgetData);
      setTotalBudget(totalBudget + parseFloat(newAmount));
    }
    
    // Reset form
    setNewCategory('');
    setNewAmount('');
  };

  const handleUpdateBudget = async (category, amount) => {
    if (parseFloat(amount) < 0) return;
    
    const oldAmount = budgetData[category].budgeted;
    const updatedBudgetData = {
      ...budgetData,
      [category]: {
        ...budgetData[category],
        budgeted: parseFloat(amount)
      }
    };
    
    setBudgetData(updatedBudgetData);
    setTotalBudget(totalBudget - oldAmount + parseFloat(amount));
    
    // In a real app, update in Firestore
  };

  const handleRemoveCategory = async (category) => {
    const updatedCategories = categories.filter(cat => cat !== category);
    const { [category]: removed, ...updatedBudgetData } = budgetData;
    
    setCategories(updatedCategories);
    setBudgetData(updatedBudgetData);
    setTotalBudget(totalBudget - removed.budgeted);
    setTotalSpent(totalSpent - removed.spent);
    
    // In a real app, update in Firestore
  };

  const handleMonthChange = (e) => {
    setCurrentMonth(e.target.value);
  };

  const calculatePercentage = (spent, budgeted) => {
    return Math.min(100, Math.round((spent / budgeted) * 100)) || 0;
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Generate an array of last 12 months for the dropdown
  const getLastTwelveMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      months.push({
        value: monthValue,
        label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
      });
    }
    
    return months;
  };

  const remainingBudget = totalBudget - totalSpent;
  const totalPercentage = calculatePercentage(totalSpent, totalBudget);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Budget Planner</h1>
        
        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={currentMonth}
          onChange={handleMonthChange}
        >
          {getLastTwelveMonths().map(month => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Budget Card */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700">Total Budget</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">${totalBudget.toFixed(2)}</p>
        </div>
        
        {/* Spent Card */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700">Total Spent</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">${totalSpent.toFixed(2)}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${getProgressBarColor(totalPercentage)} h-2.5 rounded-full`} 
              style={{ width: `${totalPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{totalPercentage}% of budget used</p>
        </div>
        
        {/* Remaining Card */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700">Remaining</h3>
          <p className={`text-3xl font-bold mt-2 ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${remainingBudget.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Add Budget Category Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Add/Update Budget Category</h2>
        
        <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <input
              id="category"
              type="text"
              list="existing-categories"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
              placeholder="Select or enter new category"
            />
            <datalist id="existing-categories">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          
          <div className="flex-1">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
              Budget Amount ($)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-end">
            <button type="submit" className="btn btn-primary whitespace-nowrap h-10">
              Save Category
            </button>
          </div>
        </form>
      </div>
      
      {/* Budget Category List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Budget for {formatMonth(currentMonth)}</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No budget categories found. Add your first category above.
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const { budgeted, spent } = budgetData[category] || { budgeted: 0, spent: 0 };
              const percentage = calculatePercentage(spent, budgeted);
              
              return (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{category}</h3>
                      <p className="text-sm text-gray-500">${spent.toFixed(2)} of ${budgeted.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex mt-2 md:mt-0 space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        value={budgeted}
                        onChange={(e) => handleUpdateBudget(category, e.target.value)}
                      />
                      <button
                        onClick={() => handleRemoveCategory(category)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`${getProgressBarColor(percentage)} h-2.5 rounded-full`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {percentage}% used {' '}
                    {budgeted > spent 
                      ? `(${(budgeted - spent).toFixed(2)} remaining)` 
                      : `(${(spent - budgeted).toFixed(2)} over budget)`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;