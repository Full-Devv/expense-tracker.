import { 
    collection, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    limit,
    Timestamp 
  } from 'firebase/firestore';
  import { auth, db } from './firebase';
  
  // Add a new expense
  export const addExpense = async (expenseData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const newExpense = {
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        userId: user.uid,
        type: 'expense',
        createdAt: Timestamp.now()
      };
  
      const docRef = await addDoc(collection(db, 'transactions'), newExpense);
      return { id: docRef.id, ...newExpense };
    } catch (error) {
      throw error;
    }
  };
  
  // Add a new income
  export const addIncome = async (incomeData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const newIncome = {
        ...incomeData,
        amount: parseFloat(incomeData.amount),
        userId: user.uid,
        type: 'income',
        createdAt: Timestamp.now()
      };
  
      const docRef = await addDoc(collection(db, 'transactions'), newIncome);
      return { id: docRef.id, ...newIncome };
    } catch (error) {
      throw error;
    }
  };
  
  // Update a transaction (expense or income)
  export const updateTransaction = async (id, updateData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      // If amount is included in the update, ensure it's a number
      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount);
      }
  
      const transactionRef = doc(db, 'transactions', id);
      await updateDoc(transactionRef, updateData);
      return { id, ...updateData };
    } catch (error) {
      throw error;
    }
  };
  
  // Delete a transaction
  export const deleteTransaction = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      await deleteDoc(doc(db, 'transactions', id));
      return id;
    } catch (error) {
      throw error;
    }
  };
  
  // Get transactions (expenses, incomes, or both)
  export const getTransactions = async ({ type, category, startDate, endDate, limit: limitCount = 100 }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      let q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
  
      // Add type filter if specified
      if (type) {
        q = query(q, where('type', '==', type));
      }
  
      // Add category filter if specified
      if (category) {
        q = query(q, where('category', '==', category));
      }
  
      // Add date range filters if specified
      if (startDate) {
        q = query(q, where('date', '>=', startDate));
      }
  
      if (endDate) {
        q = query(q, where('date', '<=', endDate));
      }
  
      // Add limit if specified
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
  
      const querySnapshot = await getDocs(q);
      const transactions = [];
  
      querySnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        });
      });
  
      return transactions;
    } catch (error) {
      throw error;
    }
  };
  
  // Get summary data (total income, total expenses, balance)
  export const getFinancialSummary = async ({ startDate, endDate }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      // Get all transactions within date range
      const transactions = await getTransactions({ startDate, endDate });
  
      // Calculate totals
      const summary = transactions.reduce(
        (acc, transaction) => {
          if (transaction.type === 'income') {
            acc.totalIncome += transaction.amount;
          } else if (transaction.type === 'expense') {
            acc.totalExpenses += transaction.amount;
          }
          return acc;
        },
        { totalIncome: 0, totalExpenses: 0 }
      );
  
      // Calculate balance
      summary.balance = summary.totalIncome - summary.totalExpenses;
  
      return summary;
    } catch (error) {
      throw error;
    }
  };
  
  // Get expense breakdown by category
  export const getExpensesByCategory = async ({ startDate, endDate }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      // Get all expenses within date range
      const expenses = await getTransactions({ type: 'expense', startDate, endDate });
  
      // Group by category
      const categorySummary = expenses.reduce((acc, expense) => {
        const category = expense.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += expense.amount;
        return acc;
      }, {});
  
      // Convert to array format for easier consumption by UI
      const result = Object.entries(categorySummary).map(([category, amount]) => ({
        category,
        amount
      }));
  
      // Sort by amount descending
      result.sort((a, b) => b.amount - a.amount);
  
      return result;
    } catch (error) {
      throw error;
    }
  };