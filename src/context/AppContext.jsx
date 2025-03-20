import { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [openingTasks, setOpeningTasks] = useState([]);
  const [closingTasks, setClosingTasks] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [shortages, setShortages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // שלח דיווח על ביצוע משימות
  const sendTasksReport = (type, completedTasks, totalTasks) => {
    setLoading(true);
    // כאן יש להוסיף קריאה לשרת לשליחת הדיווח
    
    // לצורך הדוגמה אנחנו מדמים תשובה מהשרת
    setTimeout(() => {
      toast.success(`דיווח על ${completedTasks} מתוך ${totalTasks} משימות ${type} נשלח בהצלחה!`);
      setLoading(false);
    }, 1000);
  };
  
  // שלח דיווח על חוסרים
  const sendShortageReport = (items) => {
    setLoading(true);
    
    // לצורך הדוגמה אנחנו מדמים תשובה מהשרת
    setTimeout(() => {
      setShortages([...shortages, ...items]);
      toast.success(`דיווח על ${items.length} פריטים חסרים נשלח בהצלחה!`);
      setLoading(false);
    }, 1000);
  };
  
  // מחיקת פריט חסר מהרשימה (למנהלים)
  const removeShortage = (id) => {
    setShortages(shortages.filter(item => item.id !== id));
    toast.info("הפריט הוסר מרשימת החוסרים");
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
    sendTasksReport,
    sendShortageReport,
    removeShortage,
    startOpeningTasks,
    startClosingTasks,
    updateTaskStatus,
    setRecipes
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};