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
 
  export const ROLES = {
    ADMIN: 'admin',
    TIPS_MANAGER: 'tips_manager',
    STAFF: 'staff'
  };
  
  export const PERMISSIONS = {
    VIEW_RECIPES: 'view_recipes',
    MANAGE_KITCHEN: 'manage_kitchen',
    MANAGE_USERS: 'manage_users',
    MANAGE_TIPS: 'manage_tips',
    VIEW_TIP_REPORTS: 'view_tip_reports',
    MANAGE_EMPLOYEES: 'manage_employees'
  };
  
  export const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: Object.values(PERMISSIONS),
    [ROLES.TIPS_MANAGER]: [
      PERMISSIONS.MANAGE_TIPS,
      PERMISSIONS.VIEW_TIP_REPORTS,
      PERMISSIONS.MANAGE_EMPLOYEES
    ],
    [ROLES.STAFF]: [
      PERMISSIONS.VIEW_RECIPES,
      PERMISSIONS.MANAGE_KITCHEN
    ]
  };

  export const updateUser = async (userId, updateData) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };
  
  // פונקציה לבדיקת הרשאות
  export const hasPermission = (userRole, requiredPermission) => {
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];
    return userPermissions.includes(requiredPermission);
  };
  
  // ניהול עובדים לטיפים
  export const tipEmployeeAPI = {
    async addEmployee(employeeData) {
      try {
        const employeeRef = await addDoc(collection(db, 'tip_employees'), {
          ...employeeData,
          isActive: true,
          createdAt: serverTimestamp()
        });
        return { id: employeeRef.id, ...employeeData };
      } catch (error) {
        console.error('Error adding employee:', error);
        throw error;
      }
    },
  
    async updateEmployee(employeeId, employeeData) {
      try {
        const employeeRef = doc(db, 'tip_employees', employeeId);
        await updateDoc(employeeRef, {
          ...employeeData,
          updatedAt: serverTimestamp()
        });
        return { id: employeeId, ...employeeData };
      } catch (error) {
        console.error('Error updating employee:', error);
        throw error;
      }
    },
  
    async deactivateEmployee(employeeId) {
      try {
        const employeeRef = doc(db, 'tip_employees', employeeId);
        await updateDoc(employeeRef, {
          isActive: false,
          deactivatedAt: serverTimestamp()
        });
        return employeeId;
      } catch (error) {
        console.error('Error deactivating employee:', error);
        throw error;
      }
    },
  
    async getActiveEmployees() {
      try {
        console.log('Fetching active employees...');
        
        // פתרון: מביאים את כל העובדים ומסננים בצד הלקוח
        const employeesRef = collection(db, 'tip_employees');
        const snapshot = await getDocs(employeesRef);
        
        if (snapshot.empty) {
          console.log('No employees found in database');
          return [];
        }
        
        const employees = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          employees.push({
            id: doc.id,
            ...data
          });
        });
        
        // סינון עובדים פעילים בלבד
        const activeEmployees = employees.filter(emp => {
          // אם השדה isActive לא קיים, נחשיב את העובד כפעיל
          return emp.isActive === true || emp.isActive === undefined;
        });
        
        // מיון לפי שם
        activeEmployees.sort((a, b) => {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB);
        });
        
        console.log(`Found ${activeEmployees.length} active employees out of ${employees.length} total`);
        return activeEmployees;
      } catch (error) {
        console.error('Error fetching active employees:', error);
        throw error;
      }
    },
  
    async getAllEmployees() {
      try {
        console.log('Fetching all employees...');
        
        const employeesRef = collection(db, 'tip_employees');
        const snapshot = await getDocs(employeesRef);
        
        if (snapshot.empty) {
          console.log('No employees found in database');
          return [];
        }
        
        const employees = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          employees.push({
            id: doc.id,
            ...data
          });
        });
        
        // מיון לפי שם
        employees.sort((a, b) => {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB);
        });
        
        console.log(`Found ${employees.length} total employees`);
        return employees;
      } catch (error) {
        console.error('Error fetching all employees:', error);
        throw error;
      }
    }
  };
  
  // ניהול משמרות וטיפים
  export const tipShiftAPI = {
    async saveShift(shiftData) {
      try {
        const shiftRef = await addDoc(collection(db, 'tip_shifts'), {
          date: shiftData.date,
          totalTips: shiftData.totalTips,
          employees: shiftData.employees,
          leftover: shiftData.leftover,
          createdBy: shiftData.createdBy,
          createdAt: serverTimestamp()
        });
        return { id: shiftRef.id, ...shiftData };
      } catch (error) {
        console.error('Error saving shift:', error);
        throw error;
      }
    },

    async updateShift(shiftId, updatedData) {
      try {
        const shiftRef = doc(db, 'tip_shifts', shiftId);
        await updateDoc(shiftRef, {
          ...updatedData,
          updatedAt: serverTimestamp()
        });
        
        return { id: shiftId, ...updatedData };
      } catch (error) {
        console.error('Error updating shift:', error);
        throw error;
      }
    },
  
    async getShiftsByDateRange(startDate, endDate) {
      try {
        // במקום להשתמש בשאילתא עם where + orderBy, נביא את כל המסמכים ונסנן בקוד
        const shiftsRef = collection(db, 'tip_shifts');
        const snapshot = await getDocs(shiftsRef);
        
        const allShifts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // סינון ומיון בקוד
        const filteredShifts = allShifts
          .filter(shift => {
            const shiftDate = shift.date.toDate();
            return shiftDate >= startDate && shiftDate <= endDate;
          })
          .sort((a, b) => b.date.toDate() - a.date.toDate()); // מיון לפי תאריך יורד
        
        return filteredShifts;
      } catch (error) {
        console.error('Error fetching shifts by date range:', error);
        throw error;
      }
    },
  
    async getEmployeeShifts(employeeId, startDate, endDate) {
      try {
        const shifts = await this.getShiftsByDateRange(startDate, endDate);
        return shifts.filter(shift => 
          shift.employees.some(emp => emp.employeeId === employeeId)
        );
      } catch (error) {
        console.error('Error fetching employee shifts:', error);
        throw error;
      }
    },
  
    async getMonthlyReport(year, month) {
      try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const shifts = await this.getShiftsByDateRange(startDate, endDate);
        
        const employeeSummary = {};
        let totalTips = 0;
        
        shifts.forEach(shift => {
          shift.employees.forEach(emp => {
            if (!employeeSummary[emp.employeeId]) {
              employeeSummary[emp.employeeId] = {
                employeeId: emp.employeeId,
                name: emp.name,
                totalHours: 0,
                totalTips: 0,
                shiftsCount: 0
              };
            }
            
            employeeSummary[emp.employeeId].totalHours += parseFloat(emp.hours) || 0;
            employeeSummary[emp.employeeId].totalTips += parseFloat(emp.tipAmount) || 0;
            employeeSummary[emp.employeeId].shiftsCount += 1;
          });
          
          totalTips += parseFloat(shift.totalTips) || 0;
        });
        
        return {
          period: { year, month },
          shifts: shifts.length,
          totalTips,
          employeeSummary: Object.values(employeeSummary),
          leftoverTotal: shifts.reduce((sum, shift) => sum + (parseFloat(shift.leftover) || 0), 0)
        };
      } catch (error) {
        console.error('Error generating monthly report:', error);
        throw error;
      }
    },

    async getShiftById(shiftId) {
    try {
      const shiftDoc = await getDoc(doc(db, 'tip_shifts', shiftId));
      
      if (!shiftDoc.exists()) {
        throw new Error('Shift not found');
      }
      
      return {
        id: shiftDoc.id,
        ...shiftDoc.data()
      };
    } catch (error) {
      console.error('Error fetching shift by ID:', error);
      throw error;
    }
  }
};