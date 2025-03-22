import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    setDoc,
    query,
    where,
    serverTimestamp,
    orderBy,
    Timestamp
  } from 'firebase/firestore';
  import { 
    getAuth, 
    createUserWithEmailAndPassword,
    deleteUser as firebaseDeleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword
  } from 'firebase/auth';
  import { db } from './firebase';
  import { uploadImage } from './cloudinary';
  
  // נהלי פתיחה
  export const getOpeningTasks = async () => {
    const tasksRef = collection(db, 'openingTasks');
    const q = query(tasksRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  export const updateOpeningTask = async (taskId, data) => {
    const taskRef = doc(db, 'openingTasks', taskId);
    await updateDoc(taskRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  };
  
  export const addOpeningTask = async (taskData) => {
    const tasksRef = collection(db, 'openingTasks');
    return await addDoc(tasksRef, {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };
  
  export const deleteOpeningTask = async (taskId) => {
    const taskRef = doc(db, 'openingTasks', taskId);
    await deleteDoc(taskRef);
  };
  
  // נהלי סגירה
  export const getClosingTasks = async () => {
    const tasksRef = collection(db, 'closingTasks');
    const q = query(tasksRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  export const updateClosingTask = async (taskId, data) => {
    const taskRef = doc(db, 'closingTasks', taskId);
    await updateDoc(taskRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  };
  
  export const addClosingTask = async (taskData) => {
    const tasksRef = collection(db, 'closingTasks');
    return await addDoc(tasksRef, {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };
  
  export const deleteClosingTask = async (taskId) => {
    const taskRef = doc(db, 'closingTasks', taskId);
    await deleteDoc(taskRef);
  };
  
  // מתכונים עם תמיכה בתמונות מ-Cloudinary
  export const getRecipes = async () => {
    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  export const getRecipeById = async (recipeId) => {
    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeDoc = await getDoc(recipeRef);
    
    if (recipeDoc.exists()) {
      return {
        id: recipeDoc.id,
        ...recipeDoc.data()
      };
    }
    
    return null;
  };
  
  export const addRecipe = async (recipeData, imageFile) => {
    let imageUrl = '/images/default-recipe.jpg';
    
    // אם יש תמונה, העלה אותה ל-Cloudinary
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (error) {
        console.error('שגיאה בהעלאת תמונה:', error);
        // אם ההעלאה נכשלה, נשתמש בתמונת ברירת מחדל
      }
    }
    
    const recipesRef = collection(db, 'recipes');
    return await addDoc(recipesRef, {
      ...recipeData,
      imageUrl,  // כתובת ה-URL של התמונה מ-Cloudinary או תמונת ברירת המחדל
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };
  
  export const updateRecipe = async (recipeId, recipeData, imageFile) => {
    let updateData = { ...recipeData };
    
    // אם יש תמונה חדשה, העלה אותה ל-Cloudinary
    if (imageFile) {
      try {
        updateData.imageUrl = await uploadImage(imageFile);
      } catch (error) {
        console.error('שגיאה בהעלאת תמונה:', error);
        // אם ההעלאה נכשלה, נשאיר את התמונה הקיימת
      }
    }
    
    const recipeRef = doc(db, 'recipes', recipeId);
    await updateDoc(recipeRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  };
  
  export const deleteRecipe = async (recipeId) => {
    const recipeRef = doc(db, 'recipes', recipeId);
    await deleteDoc(recipeRef);
  };
  
  // קבלת חוסרים, כולל אלה שנמחקו בשלושת הימים האחרונים
  export const getShortages = async () => {
    const shortagesRef = collection(db, 'shortages');
    const q = query(shortagesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const currentDate = new Date();
    const threeDaysAgo = new Date(currentDate);
    threeDaysAgo.setDate(currentDate.getDate() - 3);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // בדיקה אם הפריט נמחק אבל עדיין לא עברו 3 ימים
      const isRecentlyDeleted = data.deletedAt && 
                               new Date(data.deletedAt.toDate()) > threeDaysAgo;
      
      return {
        id: doc.id,
        ...data,
        // נשמור את הפריט אם הוא לא נמחק או שנמחק לאחרונה
        visible: !data.deletedAt || isRecentlyDeleted,
        // האם הפריט נמחק אבל עדיין נראה
        recentlyDeleted: isRecentlyDeleted,
        // המרת timestamps לתאריכים רגילים לקריאות
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        deletedAt: data.deletedAt ? data.deletedAt.toDate() : null,
        resolvedAt: data.resolvedAt ? data.resolvedAt.toDate() : null
      };
    })
    // נפטור רק פריטים שעדיין צריכים להיות נראים
    .filter(item => item.visible);
  };
  
  export const addShortage = async (shortageData) => {
    const shortagesRef = collection(db, 'shortages');
    return await addDoc(shortagesRef, {
      ...shortageData,
      createdAt: serverTimestamp(),
      resolved: false
    });
  };
  
  // עדכון: במקום למחוק חוסרים, נסמן אותם כנמחקים
  export const resolveShortage = async (shortageId) => {
    const shortageRef = doc(db, 'shortages', shortageId);
    await updateDoc(shortageRef, {
      deletedAt: serverTimestamp(),
      resolved: true,
      resolvedAt: serverTimestamp()
    });
  };
  
  // קבלת דוחות משימות
export const getTaskReports = async (startDate, endDate) => {
    // המרה לתאריכי firebase
    const startTimestamp = Timestamp.fromDate(new Date(startDate));
    
    // נתקן את ה-endDate כך שיהיה בסוף היום (23:59:59)
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    const endTimestamp = Timestamp.fromDate(endDateObj);
    
    const reportsRef = collection(db, 'taskReports');
    const q = query(
      reportsRef, 
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
  };
  
  // שמירת דיווח השלמת משימות
export const saveTaskReport = async (reportData) => {
    const reportsRef = collection(db, 'taskReports');
    
    // אם הדיווח מכיל תאריך כמחרוזת, המר אותו ל-Date
    if (reportData.date && typeof reportData.date === 'string') {
      const reportDate = new Date(reportData.date);
      return await addDoc(reportsRef, {
        ...reportData,
        date: serverTimestamp(), // חשוב להשתמש ב-serverTimestamp כדי שיהיה עקבי
        createdAt: serverTimestamp()
      });
    }
    
    // אם אין תאריך בדיווח, השתמש בזמן הנוכחי
    return await addDoc(reportsRef, {
      ...reportData,
      date: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  };

  export const getUsers = async () => {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  // הוספת משתמש חדש
  export const addNewUser = async (userData) => {
    const auth = getAuth();
    
    try {
      // יצירת משתמש חדש ב-Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password // הסיסמה היא מספר הטלפון
      );
      
      const userId = userCredential.user.uid;
      
      // הוספת המשתמש לאוסף users ב-Firestore
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        displayName: userData.displayName,
        email: userData.email,
        phone: userData.phone,
        role: userData.role || 'staff',
        createdAt: serverTimestamp()
      });
      
      return userId;
    } catch (error) {
      console.error('שגיאה ביצירת משתמש:', error);
      throw error;
    }
  };
  
  // מחיקת משתמש
  export const deleteUser = async (userId) => {
    try {
      // מחיקת המשתמש מ-Firestore
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      // בסביבה אמיתית, נצטרך גם למחוק את המשתמש מ-Firebase Authentication
      // אך מחיקה זו דורשת הרשאות מיוחדות או פעולה מנהלתית
      // בדרך כלל כדאי לבצע את זה בצד השרת באמצעות Cloud Functions
      
      return true;
    } catch (error) {
      console.error('שגיאה במחיקת משתמש:', error);
      throw error;
    }
  };