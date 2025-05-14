import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    orderBy
  } from 'firebase/firestore';
  import { auth, db } from './firebase';
  
  // Add a new financial goal
  export const addGoal = async (goalData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const newGoal = {
        ...goalData,
        targetAmount: parseFloat(goalData.targetAmount),
        currentAmount: parseFloat(goalData.currentAmount || 0),
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      const docRef = await addDoc(collection(db, 'goals'), newGoal);
      return { id: docRef.id, ...newGoal };
    } catch (error) {
      throw error;
    }
  };
  
  // Get all goals for the current user
  export const getGoals = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
  
      const querySnapshot = await getDocs(goalsQuery);
      const goals = [];
  
      querySnapshot.forEach((doc) => {
        goals.push({
          id: doc.id,
          ...doc.data()
        });
      });
  
      return goals;
    } catch (error) {
      throw error;
    }
  };
  
  // Update a goal
  export const updateGoal = async (id, updateData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      // Make sure amounts are parsed as floats
      if (updateData.targetAmount) {
        updateData.targetAmount = parseFloat(updateData.targetAmount);
      }
      if (updateData.currentAmount) {
        updateData.currentAmount = parseFloat(updateData.currentAmount);
      }
  
      const goalRef = doc(db, 'goals', id);
      
      // Add updatedAt timestamp
      const updatedGoal = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
  
      await updateDoc(goalRef, updatedGoal);
      return { id, ...updatedGoal };
    } catch (error) {
      throw error;
    }
  };
  
  // Delete a goal
  export const deleteGoal = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      await deleteDoc(doc(db, 'goals', id));
      return id;
    } catch (error) {
      throw error;
    }
  };
  
  // Update the current amount of a goal
  export const updateGoalProgress = async (id, amount) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const goalRef = doc(db, 'goals', id);
      const goalDoc = await getDoc(goalRef);
  
      if (!goalDoc.exists()) {
        throw new Error('Goal not found');
      }
  
      const goal = goalDoc.data();
      const newAmount = parseFloat(amount);
  
      await updateDoc(goalRef, {
        currentAmount: newAmount,
        updatedAt: new Date().toISOString()
      });
  
      return {
        id,
        ...goal,
        currentAmount: newAmount,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  };
  
  // Get goal progress information
  export const getGoalProgress = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const goalRef = doc(db, 'goals', id);
      const goalDoc = await getDoc(goalRef);
  
      if (!goalDoc.exists()) {
        throw new Error('Goal not found');
      }
  
      const goal = goalDoc.data();
      
      // Calculate progress percentage
      const progressPercentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
      
      // Calculate remaining amount
      const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
      
      // Calculate if goal is completed
      const isCompleted = goal.currentAmount >= goal.targetAmount;
      
      // Calculate days until deadline
      const deadlineDate = new Date(goal.deadline);
      const today = new Date();
      const diffTime = Math.max(0, deadlineDate - today);
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Calculate daily amount needed to reach goal on time
      const dailyAmountNeeded = daysRemaining > 0 ? remainingAmount / daysRemaining : 0;
      
      return {
        ...goal,
        id,
        progressPercentage,
        remainingAmount,
        isCompleted,
        daysRemaining,
        dailyAmountNeeded
      };
    } catch (error) {
      throw error;
    }
  };
  
  // Let's also create a helper functions file
  // Create src/utils/helpers.js
  
  // Format currency
  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Format date for input fields
  export const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  // Get current month in YYYY-MM format
  export const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  // Get month name from YYYY-MM format
  export const getMonthName = (yearMonth) => {
    if (!yearMonth) return '';
    
    const [year, month] = yearMonth.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  // Get last 12 months in YYYY-MM format
  export const getLast12Months = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      months.push({
        value: monthValue,
        label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
      });
    }
    
    return months;
  };
  
  // Calculate progress percentage
  export const calculatePercentage = (current, target) => {
    return Math.min(100, Math.round((current / target) * 100)) || 0;
  };
  
  // Get color based on percentage
  export const getColorByPercentage = (percentage, isExpense = true) => {
    if (isExpense) {
      // For expenses (lower is better)
      if (percentage >= 100) return 'bg-red-500';
      if (percentage >= 75) return 'bg-yellow-500';
      return 'bg-green-500';
    } else {
      // For savings, etc. (higher is better)
      if (percentage >= 75) return 'bg-green-500';
      if (percentage >= 50) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };
  
  // Group transactions by category
  export const groupByCategory = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(transaction);
      return acc;
    }, {});
  };
  
  // Sum transactions by category
  export const sumByCategory = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {});
  };
  
  // Group transactions by month
  export const groupByMonth = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const month = transaction.date.substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(transaction);
      return acc;
    }, {});
  };
  
  // Calculate savings rate
  export const calculateSavingsRate = (income, expenses) => {
    if (income <= 0) return 0;
    return Math.round(((income - expenses) / income) * 100);
  };
  
  // Get remaining time text
  export const getRemainingTimeText = (deadline) => {
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