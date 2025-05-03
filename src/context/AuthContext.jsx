import { createContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../services/firebase';
import { hasPermission, PERMISSIONS } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // כאשר המשתמש מזוהה, מביא את הנתונים שלו מ-Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: user.uid,
              email: user.email,
              displayName: userData.displayName || user.email,
              role: userData.role, // וודא שהתפקיד נשמר
              ...userData
            });
            setUserRole(userData.role || 'staff');
          } else {
            // אם אין נתונים, מגדיר משתמש בסיסי
            setUser({
              uid: user.uid,
              email: user.email,
              displayName: user.email,
              role: 'staff'
            });
            setUserRole('staff');
          }
        } catch (err) {
          console.error("שגיאה בטעינת נתוני המשתמש:", err);
          setError("שגיאה בטעינת נתוני המשתמש");
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const login = async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("שגיאת התחברות:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("שם משתמש או סיסמה שגויים");
      } else {
        setError("שגיאה בהתחברות. נסה שוב מאוחר יותר");
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("שגיאה בהתנתקות:", err);
      setError("שגיאה בהתנתקות");
    }
  };

  const isAdmin = () => {
    return userRole === 'admin' || userRole === 'manager';
  };

  // פונקציה חדשה לבדיקת הרשאות
  const hasUserPermission = (permission) => {
    if (!user || !user.role) return false;
    try {
      return hasPermission(user.role, permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  // פונקציה חדשה לבדיקה אם למשתמש יש גישה לניהול טיפים
  const canAccessTipsManagement = () => {
    try {
      return hasUserPermission(PERMISSIONS.MANAGE_TIPS) || 
             hasUserPermission(PERMISSIONS.VIEW_TIP_REPORTS) || 
             hasUserPermission(PERMISSIONS.MANAGE_EMPLOYEES);
    } catch (error) {
      console.error('Error checking tips management access:', error);
      return false;
    }
  };

  // פונקציה חדשה לבדיקה אם למשתמש יש גישה לתוכן מטבח
  const canAccessKitchenContent = () => {
    try {
      return hasUserPermission(PERMISSIONS.VIEW_RECIPES) || 
             hasUserPermission(PERMISSIONS.MANAGE_KITCHEN);
    } catch (error) {
      console.error('Error checking kitchen content access:', error);
      return false;
    }
  };

  const value = {
    user,
    userRole,
    loading,
    error,
    login,
    logout,
    isAdmin,
    hasUserPermission,
    canAccessTipsManagement,
    canAccessKitchenContent
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};