import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';
import { useApp } from '../../hooks/useApp';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const TaskListContainer = styled.div`
  margin-bottom: 2rem;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const TaskCheckbox = styled.input`
  margin-left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
`;

const TaskContent = styled.div`
  flex: 1;
`;

const TaskTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const TaskDescription = styled.p`
  color: #666;
`;

const ReportButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`;

const ReportButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #1e3a6a;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  svg {
    margin-left: 0.5rem;
  }
`;

const ProgressText = styled.p`
  font-size: 1rem;
  color: #666;
`;

const TaskList = ({ tasks, type }) => {
  const { updateTaskStatus, sendTasksReport, loading } = useApp();
  const { isAdmin } = useAuth();
  const [isReported, setIsReported] = useState(false);
  // שינוי כאן - נשתמש ב-state מקומי לשמירת מצב הסימון של המשימות
  // זה חיוני כדי למנוע את אובדן הסימון בעת רינדור מחדש
  const [checkedTasks, setCheckedTasks] = useState({});
  
  // בעת טעינת הרכיב, נאתחל את מצב הסימון לפי המשימות שהתקבלו
  useEffect(() => {
    // נשמור את מצב הסימון הקיים אם יש
    const initialCheckedState = {};
    tasks.forEach(task => {
      // אם כבר יש מצב שמור למשימה זו, נשתמש בו, אחרת נשתמש ב-completed מהמשימה
      initialCheckedState[task.id] = checkedTasks[task.id] !== undefined ? 
        checkedTasks[task.id] : (task.completed || false);
    });
    setCheckedTasks(initialCheckedState);
  }, [tasks]); // נעדכן רק כאשר ה-tasks משתנים
  
  const handleCheckTask = (id, checked) => {
    // עדכון ה-state המקומי
    setCheckedTasks(prev => ({
      ...prev,
      [id]: checked
    }));
    
    // עדכון במצב האפליקציה הגלובלי
    updateTaskStatus(id, type, checked);
  };
  
  const handleReport = async () => {
    // בדיקה שכל המשימות מסומנות כמושלמות
    const allTasksCompleted = tasks.every(task => checkedTasks[task.id]);
    
    if (!allTasksCompleted) {
      toast.warn('יש להשלים את כל המשימות לפני הדיווח');
      return;
    }
    
    try {
      const completedTasks = tasks.length;
      await sendTasksReport(type, completedTasks, tasks.length);
      setIsReported(true);
      toast.success(`הדיווח על השלמת משימות ${type === 'opening' ? 'פתיחה' : 'סגירה'} נשלח בהצלחה!`);
    } catch (error) {
      console.error('שגיאה בשליחת דיווח:', error);
      toast.error('אירעה שגיאה בשליחת הדיווח');
    }
  };
  
  // חישוב כמה משימות סומנו כמושלמות
  const completedCount = tasks.filter(task => checkedTasks[task.id]).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  
  return (
    <TaskListContainer>
      {tasks.map((task) => (
        <TaskItem key={task.id}>
          <TaskCheckbox
            type="checkbox"
            checked={checkedTasks[task.id] || false}
            onChange={(e) => handleCheckTask(task.id, e.target.checked)}
            disabled={isReported}
            id={`task-${task.id}`}
          />
          <TaskContent>
            <TaskTitle>
              <label htmlFor={`task-${task.id}`} style={{ cursor: 'pointer' }}>
                {task.title}
              </label>
            </TaskTitle>
            {task.description && <TaskDescription>{task.description}</TaskDescription>}
          </TaskContent>
        </TaskItem>
      ))}
      
      <ReportButtonContainer>
        <ProgressText>
          הושלמו {completedCount} מתוך {tasks.length} משימות ({progress}%)
        </ProgressText>
        
        <ReportButton 
          onClick={handleReport} 
          disabled={loading || isReported || completedCount < tasks.length}
        >
          <FaCheck />
          {isReported ? 'דווח בהצלחה' : 'דווח על השלמת המשימות'}
        </ReportButton>
      </ReportButtonContainer>
    </TaskListContainer>
  );
};

export default TaskList;