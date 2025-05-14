import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      try {
        // This is placeholder code - in a real app, you'd implement
        // data fetching from Firestore
        setTotalIncome(5250.75);
        setTotalExpenses(3120.45);
        setRecentTransactions([
          { id: 1, type: 'expense', category: 'Groceries', amount: 85.32, date: '2025-05-12' },
          { id: 2, type: 'income', category: 'Salary', amount: 2500.00, date: '2025-05-10' },
          { id: 3, type: 'expense', category: 'Utilities', amount: 145.78, date: '2025-05-08' },
          { id: 4, type: 'expense', category: 'Dining', amount: 65.20, date: '2025-05-05' },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financial Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="card bg-white">
          <h3 className="text-lg font-medium text-gray-700">Current Balance</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">${(totalIncome - totalExpenses).toFixed(2)}</p>
        </div>
        
        {/* Income Card */}
        <div className="card bg-white">
          <h3 className="text-lg font-medium text-gray-700">Total Income</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">${totalIncome.toFixed(2)}</p>
        </div>
        
        {/* Expenses Card */}
        <div className="card bg-white">
          <h3 className="text-lg font-medium text-gray-700">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">${totalExpenses.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700">Recent Transactions</h3>
          <button className="text-primary-600 hover:text-primary-700">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{transaction.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;