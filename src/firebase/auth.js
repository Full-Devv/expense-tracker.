import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    updateEmail,
    updatePassword
  } from 'firebase/auth';
  import { auth, db } from './firebase';
  import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
  
  // Register a new user
  export const registerUser = async (name, email, password) => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Update user profile with name
      await updateProfile(user, {
        displayName: name
      });
  
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        // Default categories for the user
        expenseCategories: ['Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Personal', 'Education', 'Other'],
        incomeCategories: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other']
      });
  
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  // Login user
  export const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // Logout user
  export const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };
  
  // Reset password
  export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };
  
  // Update user profile
  export const updateUserProfile = async (displayName) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      await updateProfile(user, {
        displayName
      });
  
      await updateDoc(doc(db, 'users', user.uid), {
        name: displayName
      });
  
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  // Update user email
  export const updateUserEmail = async (newEmail) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      await updateEmail(user, newEmail);
  
      await updateDoc(doc(db, 'users', user.uid), {
        email: newEmail
      });
  
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  // Update user password
  export const updateUserPassword = async (newPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      await updatePassword(user, newPassword);
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  // Get user data from Firestore
  export const getUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        throw new Error('User document not found');
      }
    } catch (error) {
      throw error;
    }
  };