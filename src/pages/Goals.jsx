// GOALS PAGE
// Create src/pages/Goals.jsx

import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    priority: 'medium',
    notes: ''
  });
  const [filter, setFilter] = useState('all'); // all, active, completed
  
  useEffect(() => {
    fetchGoals();
  }, [filter]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      // For now, just use dummy data
      const dummyGoals = [
        { 
          id: '1', 
          name: 'Emergency Fund', 
          targetAmount: 10000, 
          currentAmount: 5000, 
          deadline: '2025-12-31',
          priority: 'high',
          notes: 'Build a 3-month emergency fund',
          createdAt: '2025-01-15'
        },
        { 
          id: '2', 
          name: 'New Car', 
          targetAmount: 25000, 
          currentAmount: 8000, 
          deadline: '2026-06-30',
          priority: 'medium',
          notes: 'Save for a reliable used car',
          createdAt: '2025-02-10'
        },
        { 
          id: '3', 
          name: 'Vacation', 
          targetAmount: 3000, 
          currentAmount: 1500, 
          deadline: '2025-08-15',
          priority: 'low',
          notes: 'Summer vacation fund',
          createdAt: '2025-03-01'
        },
        { 
          id: '4', 
          name: 'Down Payment', 
          targetAmount: 50000, 
          currentAmount: 15000, 
          deadline: '2027-01-01',
          priority: 'high',
          notes: 'House down payment',
          createdAt: '2025-01-05'
        },
      ];
      
      let filteredGoals = dummyGoals;
      
      if (filter === 'active') {
        filteredGoals = dummyGoals.filter(goal => goal.currentAmount < goal.targetAmount);
      } else if (filter === 'completed') {
        filteredGoals = dummyGoals.filter(goal => goal.currentAmount >= goal.targetAmount);
      }
      
      setGoals(filteredGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
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
      const newGoal = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        userId,
        createdAt: new Date().toISOString()
      };
      
      // In a real app, you would add this to Firestore
      // await addDoc(collection(db, 'goals'), newGoal);
      
      // For now, just update the local state
      setGoals([
        {
          id: Math.random().toString(36).substr(2, 9),
          ...newGoal
        },
        ...goals
      ]);
      
      // Reset form
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        priority: 'medium',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };
  
  const handleUpdateAmount = async (id, newAmount) => {
    try {
      const amount = parseFloat(newAmount);
      if (isNaN(amount) || amount < 0) return;
      
      // In a real app, you would update this in Firestore
      // await updateDoc(doc(db, 'goals', id), { currentAmount: amount });
      
      // For now, just update the local state
      setGoals(goals.map(goal => 
        goal.id === id ? { ...goal, currentAmount: amount } : goal
      ));
    } catch (error) {
      console.error('Error updating goal amount:', error);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      // In a real app, you would delete from Firestore
      // await deleteDoc(doc(db, 'goals', id));
      
      // For now, just update the local state
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const calculateProgress = (current, target) => {
    return Math.min(100, Math.round((current / target) * 100)) || 0;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRemainingTime = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = Math.abs(deadlineDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (deadlineDate < now) {
      return 'Deadline passed';
    }
    
    if (diffDays > 365) {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} left`;
    }
    
    if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} left`;
    }
    
    return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financial Goals</h1>
      
      {/* Add Goal Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Create New Goal</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Goal Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="targetAmount">
              Target Amount ($)
            </label>
            <input
              id="targetAmount"
              name="targetAmount"
              type="number"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.targetAmount}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentAmount">
              Current Amount ($)
            </label>
            <input
              id="currentAmount"
              name="currentAmount"
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.currentAmount}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deadline">
              Target Date
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.deadline}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Notes
            </label>
            <input
              id="notes"
              name="notes"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary">
              Create Goal
            </button>
          </div>
        </form>
      </div>
      
      {/* Goals List */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold">Your Goals</h2>
          
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded-md ${filter === 'active' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`px-3 py-1 rounded-md ${filter === 'completed' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No goals found. Create your first financial goal!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              const isComplete = progress >= 100;
              
              return (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-medium">{goal.name}</h3>
                      <p className="text-sm text-gray-500">{goal.notes}</p>
                    </div>
                    <span className={`text-sm font-medium ${getPriorityColor(goal.priority)}`}>
                      {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${isComplete ? 'bg-green-500' : 'bg-primary-600'} h-2.5 rounded-full`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">
                      <span>Deadline: {goal.deadline}</span>
                      <p>{getRemainingTime(goal.deadline)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        value={goal.currentAmount}
                        onChange={(e) => handleUpdateAmount(goal.id, e.target.value)}
                      />
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {!isComplete && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Need ${(goal.targetAmount - goal.currentAmount).toFixed(2)} more to reach your goal.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;