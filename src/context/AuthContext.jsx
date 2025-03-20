import { createContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../services/firebase';

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
              ...userData
            });
            setUserRole(userData.role || 'staff');
          } else {
            // אם אין נתונים, מגדיר משתמש בסיסי
            setUser({
              uid: user.uid,
              email: user.email,
              displayName: user.email,
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

  const value = {
    user,
    userRole,
    loading,
    error,
    login,
    logout,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};