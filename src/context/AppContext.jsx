import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getShortages, saveTaskReport } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [openingTasks, setOpeningTasks] = useState([]);
  const [closingTasks, setClosingTasks] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [shortages, setShortages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // קבלת פרטי המשתמש המחובר
  
  // טעינת נתוני חוסרים בטעינת האפליקציה
  useEffect(() => {
    const loadShortages = async () => {
      try {
        const shortagesData = await getShortages();
        setShortages(shortagesData);
      } catch (err) {
        console.error('שגיאה בטעינת חוסרים:', err);
      }
    };
    
    loadShortages();
  }, []);
  
  // שלח דיווח על ביצוע משימות
  const sendTasksReport = async (type, completedTasks, totalTasks) => {
    setLoading(true);
    
    try {
      // בניית אובייקט הדיווח
      const reportData = {
        type,
        completedTasks,
        totalTasks,
        completionRate: Math.round((completedTasks / totalTasks) * 100),
        userId: user?.uid,
        userName: user?.displayName || user?.email || 'משתמש לא ידוע',
        tasksList: type === 'opening' 
          ? openingTasks.map(task => ({ id: task.id, title: task.title, completed: true })) 
          : closingTasks.map(task => ({ id: task.id, title: task.title, completed: true })),
        date: new Date().toISOString(),
      };
      
      // שמירת הדיווח בבסיס הנתונים
      await saveTaskReport(reportData);
      
      toast.success(`דיווח על ${completedTasks} מתוך ${totalTasks} משימות ${type === 'opening' ? 'פתיחה' : 'סגירה'} נשלח בהצלחה!`);
      return true;
    } catch (err) {
      console.error('שגיאה בשליחת דיווח משימות:', err);
      toast.error('אירעה שגיאה בשליחת הדיווח');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // התחלת ביצוע משימות בפתיחה
  const startOpeningTasks = (tasks) => {
    setOpeningTasks(tasks.map(task => ({ ...task, completed: false })));
  };
  
  // התחלת ביצוע משימות בסגירה
  const startClosingTasks = (tasks) => {
    setClosingTasks(tasks.map(task => ({ ...task, completed: false })));
  };
  
  // עדכון סטטוס משימה
  const updateTaskStatus = (taskId, type, completed) => {
    if (type === 'opening') {
      setOpeningTasks(openingTasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
    } else if (type === 'closing') {
      setClosingTasks(closingTasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
    }
  };

  const value = {
    openingTasks,
    closingTasks,
    recipes,
    shortages,
    loading,
    setLoading,
    sendTasksReport,
    startOpeningTasks,
    startClosingTasks,
    updateTaskStatus,
    setRecipes,
    setShortages
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};