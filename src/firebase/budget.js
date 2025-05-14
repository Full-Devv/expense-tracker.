import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs
  } from 'firebase/firestore';
  import { auth, db } from './firebase';
  
  // Get user's budget for a specific month
  export const getBudget = async (yearMonth) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const budgetRef = doc(db, 'budgets', `${user.uid}_${yearMonth}`);
      const budgetSnap = await getDoc(budgetRef);
  
      if (budgetSnap.exists()) {
        return { id: budgetSnap.id, ...budgetSnap.data() };
      } else {
        // Return empty budget structure if not found
        return {
          id: null,
          userId: user.uid,
          yearMonth,
          categories: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      throw error;
    }
  };
  
  // Create or update budget for a specific month
  export const saveBudget = async (yearMonth, budgetData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const budgetId = `${user.uid}_${yearMonth}`;
      const budgetRef = doc(db, 'budgets', budgetId);
      const budgetSnap = await getDoc(budgetRef);
  
      const updatedBudget = {
        userId: user.uid,
        yearMonth,
        categories: budgetData.categories || {},
        updatedAt: new Date().toISOString()
      };
  
      if (budgetSnap.exists()) {
        // Update existing budget
        await updateDoc(budgetRef, updatedBudget);
      } else {
        // Create new budget
        updatedBudget.createdAt = new Date().toISOString();
        await setDoc(budgetRef, updatedBudget);
      }
  
      return { id: budgetId, ...updatedBudget };
    } catch (error) {
      throw error;
    }
  };
  
  // Add or update a budget category
  export const updateBudgetCategory = async (yearMonth, category, amount) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const budgetId = `${user.uid}_${yearMonth}`;
      const budgetRef = doc(db, 'budgets', budgetId);
      const budgetSnap = await getDoc(budgetRef);
  
      if (budgetSnap.exists()) {
        // Update existing budget
        const existingBudget = budgetSnap.data();
        const updatedCategories = {
          ...existingBudget.categories,
          [category]: parseFloat(amount)
        };
  
        await updateDoc(budgetRef, {
          categories: updatedCategories,
          updatedAt: new Date().toISOString()
        });
  
        return {
          id: budgetId,
          ...existingBudget,
          categories: updatedCategories,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Create new budget with this category
        const newBudget = {
          userId: user.uid,
          yearMonth,
          categories: { [category]: parseFloat(amount) },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
  
        await setDoc(budgetRef, newBudget);
        return { id: budgetId, ...newBudget };
      }
    } catch (error) {
      throw error;
    }
  };
  
  // Remove a budget category
  export const removeBudgetCategory = async (yearMonth, category) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const budgetId = `${user.uid}_${yearMonth}`;
      const budgetRef = doc(db, 'budgets', budgetId);
      const budgetSnap = await getDoc(budgetRef);
  
      if (budgetSnap.exists()) {
        const existingBudget = budgetSnap.data();
        const updatedCategories = { ...existingBudget.categories };
        
        // Delete the category
        delete updatedCategories[category];
  
        await updateDoc(budgetRef, {
          categories: updatedCategories,
          updatedAt: new Date().toISOString()
        });
  
        return {
          id: budgetId,
          ...existingBudget,
          categories: updatedCategories,
          updatedAt: new Date().toISOString()
        };
      } else {
        throw new Error('Budget not found');
      }
    } catch (error) {
      throw error;
    }
  };
  
  // Get budget performance (budget vs actual spending)
  export const getBudgetPerformance = async (yearMonth) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      // Get budget for the month
      const budget = await getBudget(yearMonth);
  
      // Get start and end dates for the month
      const [year, month] = yearMonth.split('-');
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0); // Last day of month
  
      // Format dates for Firestore query
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
  
      // Get all expenses for the month
      const expenses = await getTransactions({
        type: 'expense',
        startDate: startDateStr,
        endDate: endDateStr
      });
  
      // Calculate actual spending by category
      const actualByCategory = expenses.reduce((acc, expense) => {
        const category = expense.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += expense.amount;
        return acc;
      }, {});
  
      // Combine budget and actual data
      const performance = {
        yearMonth,
        categories: {}
      };
  
      // Add all budget categories
      Object.entries(budget.categories || {}).forEach(([category, budgeted]) => {
        performance.categories[category] = {
          budgeted,
          actual: actualByCategory[category] || 0,
          remaining: budgeted - (actualByCategory[category] || 0)
        };
      });
  
      // Add categories that have expenses but no budget
      Object.entries(actualByCategory).forEach(([category, actual]) => {
        if (!performance.categories[category]) {
          performance.categories[category] = {
            budgeted: 0,
            actual,
            remaining: -actual
          };
        }
      });
  
      // Calculate totals
      const totals = Object.values(performance.categories).reduce(
        (acc, { budgeted, actual }) => {
          acc.budgeted += budgeted;
          acc.actual += actual;
          return acc;
        },
        { budgeted: 0, actual: 0 }
      );
  
      totals.remaining = totals.budgeted - totals.actual;
      performance.totals = totals;
  
      return performance;
    } catch (error) {
      throw error;
    }
  };