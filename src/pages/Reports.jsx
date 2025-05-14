// REPORTS PAGE
// Create src/pages/Reports.jsx

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('expenses-by-category');
  const [timeRange, setTimeRange] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [reportData, setReportData] = useState([]);
  
  useEffect(() => {
    fetchReportData();
  }, [reportType, timeRange, customDateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch this data from Firestore
      // For now, just use dummy data
      
      // Dummy expense data
      const dummyExpenses = [
        { category: 'Food', amount: 520.45, date: '2025-05-10' },
        { category: 'Housing', amount: 1200.00, date: '2025-05-05' },
        { category: 'Transportation', amount: 245.75, date: '2025-05-12' },
        { category: 'Utilities', amount: 187.23, date: '2025-05-08' },
        { category: 'Entertainment', amount: 125.50, date: '2025-05-15' },
        { category: 'Healthcare', amount: 85.00, date: '2025-05-18' },
        { category: 'Personal', amount: 142.80, date: '2025-05-20' },
        { category: 'Food', amount: 85.25, date: '2025-04-25' },
        { category: 'Housing', amount: 1200.00, date: '2025-04-05' },
        { category: 'Transportation', amount: 178.50, date: '2025-04-12' },
        { category: 'Food', amount: 92.35, date: '2025-04-18' },
      ];
      
      // Dummy income data
      const dummyIncome = [
        { category: 'Salary', amount: 3500.00, date: '2025-05-01' },
        { category: 'Freelance', amount: 850.00, date: '2025-05-15' },
        { category: 'Investments', amount: 125.75, date: '2025-05-20' },
        { category: 'Salary', amount: 3500.00, date: '2025-04-01' },
        { category: 'Freelance', amount: 650.00, date: '2025-04-12' },
      ];
      
      setExpenseData(dummyExpenses);
      setIncomeData(dummyIncome);
      
      // Process the data based on report type
      let data = [];
      
      switch (reportType) {
        case 'expenses-by-category':
          data = processExpensesByCategory(dummyExpenses);
          break;
        case 'income-vs-expenses':
          data = processIncomeVsExpenses(dummyExpenses, dummyIncome);
          break;
        case 'monthly-overview':
          data = processMonthlyOverview(dummyExpenses, dummyIncome);
          break;
        case 'savings-rate':
          data = processSavingsRate(dummyExpenses, dummyIncome);
          break;
        default:
          data = processExpensesByCategory(dummyExpenses);
      }
      
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processExpensesByCategory = (expenses) => {
    // Group expenses by category and sum the amounts
    const categoryMap = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});
    
    // Transform to array format for chart
    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: 0, // Will calculate after we have the total
    }));
  };

  const processIncomeVsExpenses = (expenses, income) => {
    // Group by month
    const monthlyData = {};
    
    // Process expenses
    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { month, expenses: 0, income: 0 };
      }
      monthlyData[month].expenses += expense.amount;
    });
    
    // Process income
    income.forEach(inc => {
      const month = inc.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { month, expenses: 0, income: 0 };
      }
      monthlyData[month].income += inc.amount;
    });
    
    // Transform to array and sort by month
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const processMonthlyOverview = (expenses, income) => {
    // Get the current month
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    // Filter for current month
    const currentMonthExpenses = expenses.filter(expense => 
      expense.date.substring(0, 7) === currentMonth
    );
    
    const currentMonthIncome = income.filter(inc => 
      inc.date.substring(0, 7) === currentMonth
    );
    
    // Calculate totals
    const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = currentMonthIncome.reduce((sum, inc) => sum + inc.amount, 0);
    
    // Process expenses by category
    const expensesByCategory = processExpensesByCategory(currentMonthExpenses);
    
    // Calculate percentages
    expensesByCategory.forEach(item => {
      item.percentage = Math.round((item.amount / totalExpenses) * 100);
    });
    
    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      expensesByCategory,
      savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0
    };
  };

  const processSavingsRate = (expenses, income) => {
    // Group by month
    const monthlyData = {};
    
    // Process expenses
    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { month, expenses: 0, income: 0 };
      }
      monthlyData[month].expenses += expense.amount;
    });
    
    // Process income
    income.forEach(inc => {
      const month = inc.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { month, expenses: 0, income: 0 };
      }
      monthlyData[month].income += inc.amount;
    });
    
    // Calculate savings rate
    Object.values(monthlyData).forEach(data => {
      data.savingsRate = data.income > 0 
        ? Math.round(((data.income - data.expenses) / data.income) * 100) 
        : 0;
    });
    
    // Transform to array and sort by month
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    switch (reportType) {
      case 'expenses-by-category':
        return renderExpensesByCategoryReport();
      case 'income-vs-expenses':
        return renderIncomeVsExpensesReport();
      case 'monthly-overview':
        return renderMonthlyOverviewReport();
      case 'savings-rate':
        return renderSavingsRateReport();
      default:
        return renderExpensesByCategoryReport();
    }
  };

  const renderExpensesByCategoryReport = () => {
    // Calculate total expenses and percentages
    const totalExpenses = reportData.reduce((sum, item) => sum + item.amount, 0);
    const dataWithPercentages = reportData.map(item => ({
      ...item,
      percentage: Math.round((item.amount / totalExpenses) * 100)
    }));
    
    // Sort by amount descending
    dataWithPercentages.sort((a, b) => b.amount - a.amount);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Expenses by Category</h3>
          <p className="text-sm text-gray-500">Total: ${totalExpenses.toFixed(2)}</p>
        </div>
        
        {dataWithPercentages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No expense data available for this period.
          </div>
        ) : (
          <>
            {/* Bar Chart Visualization */}
            <div className="h-64 space-y-2">
              {dataWithPercentages.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-32 text-sm truncate" title={item.category}>
                    {item.category}
                  </div>
                  <div className="flex-1 h-6 bg-gray-200 rounded-full">
                    <div
                      className="h-6 bg-primary-600 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-24 text-sm text-right">
                    ${item.amount.toFixed(2)} ({item.percentage}%)
                  </div>
                </div>
              ))}
            </div>
            
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataWithPercentages.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderIncomeVsExpensesReport = () => {
    // Sort by month descending (most recent first)
    const sortedData = [...reportData].sort((a, b) => b.month.localeCompare(a.month));
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Income vs Expenses</h3>
        
        {sortedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No data available for this period.
          </div>
        ) : (
          <>
            {/* Bar Chart Visualization */}
            <div className="h-64 space-y-4">
              {sortedData.map((item, index) => {
                const monthDate = new Date(item.month + '-01');
                const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="text-sm font-medium">{monthName}</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 text-sm text-right">Income</div>
                      <div className="flex-1 h-6 bg-gray-200 rounded-full">
                        <div
                          className="h-6 bg-green-500 rounded-full"
                          style={{ width: `${Math.min(100, (item.income / Math.max(item.income, item.expenses)) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="w-24 text-sm text-right">
                        ${item.income.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 text-sm text-right">Expenses</div>
                      <div className="flex-1 h-6 bg-gray-200 rounded-full">
                        <div
                          className="h-6 bg-red-500 rounded-full"
                          style={{ width: `${Math.min(100, (item.expenses / Math.max(item.income, item.expenses)) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="w-24 text-sm text-right">
                        ${item.expenses.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedData.map((item, index) => {
                    const monthDate = new Date(item.month + '-01');
                    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
                    const balance = item.income - item.expenses;
                    
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{monthName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">${item.income.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">${item.expenses.toFixed(2)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${balance.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderMonthlyOverviewReport = () => {
    if (!reportData.expensesByCategory) {
      return (
        <div className="text-center py-8 text-gray-500">
          No data available for this month.
        </div>
      );
    }
    
    const { totalIncome, totalExpenses, balance, expensesByCategory, savingsRate } = reportData;
    
    // Get current month name
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Overview for {currentMonthName}</h3>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-white p-4">
            <h4 className="text-sm font-medium text-gray-500">Total Income</h4>
            <p className="text-xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </div>
          
          <div className="card bg-white p-4">
            <h4 className="text-sm font-medium text-gray-500">Total Expenses</h4>
            <p className="text-xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          </div>
          
          <div className="card bg-white p-4">
            <h4 className="text-sm font-medium text-gray-500">Net Balance</h4>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Savings Rate */}
        <div className="card bg-white p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-500">Savings Rate</h4>
            <p className="text-sm font-medium">{savingsRate}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${savingsRate >= 20 ? 'bg-green-500' : savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'} h-2.5 rounded-full`} 
              style={{ width: `${savingsRate}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Financial experts recommend a savings rate of at least 20%.
          </p>
        </div>
        
        {/* Expense Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-4">Expense Breakdown</h4>
          
          {expensesByCategory.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No expenses recorded this month.
            </div>
          ) : (
            <div className="space-y-2">
              {expensesByCategory.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-32 text-sm truncate" title={item.category}>
                    {item.category}
                  </div>
                  <div className="flex-1 h-6 bg-gray-200 rounded-full">
                    <div
                      className="h-6 bg-primary-600 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-24 text-sm text-right">
                    ${item.amount.toFixed(2)} ({item.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSavingsRateReport = () => {
    // Sort by month
    const sortedData = [...reportData].sort((a, b) => a.month.localeCompare(b.month));
    
    // Calculate average savings rate
    const totalSavingsRate = sortedData.reduce((sum, item) => sum + item.savingsRate, 0);
    const averageSavingsRate = sortedData.length > 0 ? Math.round(totalSavingsRate / sortedData.length) : 0;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Savings Rate Trend</h3>
          <p className="text-sm text-gray-500">Average: {averageSavingsRate}%</p>
        </div>
        
        {sortedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No data available for this period.
          </div>
        ) : (
          <>
            {/* Line Chart Visualization */}
            <div className="h-64 relative">
              <div className="absolute top-0 left-0 h-full w-full flex items-end justify-between">
                {sortedData.map((item, index) => {
                  const monthDate = new Date(item.month + '-01');
                  const monthName = monthDate.toLocaleString('default', { month: 'short' });
                  const barHeight = `${Math.max(0, item.savingsRate)}%`;
                  
                  return (
                    <div key={index} className="flex flex-col items-center w-full">
                      <div className="text-xs mb-1">{item.savingsRate}%</div>
                      <div 
                        className={`w-3/4 ${item.savingsRate >= 20 ? 'bg-green-500' : item.savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ height: barHeight }}
                      ></div>
                      <div className="text-xs mt-1">{monthName}</div>
                    </div>
                  );
                })}
              </div>
              
              {/* Reference lines */}
              <div className="absolute w-full border-t border-dashed border-green-500" style={{ top: '20%' }}>
                <span className="absolute right-0 -top-3 text-xs text-green-500">20% (Recommended)</span>
              </div>
              <div className="absolute w-full border-t border-dashed border-yellow-500" style={{ top: '50%' }}>
                <span className="absolute right-0 -top-3 text-xs text-yellow-500">10%</span>
              </div>
            </div>
            
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedData.map((item, index) => {
                    const monthDate = new Date(item.month + '-01');
                    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
                    const savings = item.income - item.expenses;
                    
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{monthName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.income.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.expenses.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${savings.toFixed(2)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          item.savingsRate >= 20 ? 'text-green-600' : item.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {item.savingsRate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange({
      ...customDateRange,
      [name]: value
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financial Reports</h1>
      
      {/* Report Controls */}
      <div className="card bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reportType">
              Report Type
            </label>
            <select
              id="reportType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="expenses-by-category">Expenses by Category</option>
              <option value="income-vs-expenses">Income vs Expenses</option>
              <option value="monthly-overview">Monthly Overview</option>
              <option value="savings-rate">Savings Rate</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timeRange">
              Time Range
            </label>
            <select
              id="timeRange"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="month">Current Month</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
        
        {timeRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={customDateRange.startDate}
                onChange={handleCustomDateChange}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                End Date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={customDateRange.endDate}
                onChange={handleCustomDateChange}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Report Content */}
      <div className="card bg-white">
        {renderReportContent()}
      </div>
      
      {/* Download Report Button */}
      <div className="flex justify-end">
        <button className="btn btn-primary">
          Download Report
        </button>
      </div>
    </div>
  );
};

export default Reports;