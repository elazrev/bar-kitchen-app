import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    serverTimestamp,
    orderBy
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { db, storage } from './firebase';
  
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
  
  // מתכונים
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
    // העלאת התמונה, אם קיימת
    let imageUrl = '';
    if (imageFile) {
      const storageRef = ref(storage, `recipes/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    
    const recipesRef = collection(db, 'recipes');
    return await addDoc(recipesRef, {
      ...recipeData,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };
  
  export const updateRecipe = async (recipeId, recipeData, imageFile) => {
    // העלאת תמונה חדשה, אם קיימת
    let updateData = { ...recipeData };
    
    if (imageFile) {
      const storageRef = ref(storage, `recipes/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      updateData.imageUrl = await getDownloadURL(storageRef);
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
  
  // דיווחי חוסרים
  export const getShortages = async () => {
    const shortagesRef = collection(db, 'shortages');
    const q = query(shortagesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  export const addShortage = async (shortageData) => {
    const shortagesRef = collection(db, 'shortages');
    return await addDoc(shortagesRef, {
      ...shortageData,
      createdAt: serverTimestamp(),
      resolved: false
    });
  };
  
  export const resolveShortage = async (shortageId) => {
    const shortageRef = doc(db, 'shortages', shortageId);
    await updateDoc(shortageRef, {
      resolved: true,
      resolvedAt: serverTimestamp()
    });
  };
  
  // דוחות
  export const getReports = async (startDate, endDate) => {
    // יצירת דוחות לפי טווח תאריכים
    // כאן ניתן להוסיף היגיון עסקי נוסף לפי צורך
  };