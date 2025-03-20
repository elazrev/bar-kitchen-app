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
  const [localTasks, setLocalTasks] = useState([]);
  
  // עדכון ה-localTasks בכל פעם שמשתנה tasks
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setLocalTasks(tasks.map(task => ({ ...task, completed: task.completed || false })));
    }
  }, [tasks]);
  
  const handleCheckTask = (id, checked) => {
    // עדכון מקומי של מצב המשימה
    const updatedTasks = localTasks.map(task => 
      task.id === id ? { ...task, completed: checked } : task
    );
    
    setLocalTasks(updatedTasks);
    
    // עדכון במצב האפליקציה הגלובלי
    updateTaskStatus(id, type, checked);
  };
  
  const handleReport = async () => {
    // וידוא שכל המשימות בוצעו
    if (localTasks.some(task => !task.completed)) {
      toast.warn('יש להשלים את כל המשימות לפני הדיווח');
      return;
    }
    
    try {
      const completedTasks = localTasks.filter(task => task.completed).length;
      
      // יצירת אובייקט דיווח מפורט יותר
      const reportDetails = {
        completedTasks,
        totalTasks: localTasks.length,
        tasks: localTasks.map(({ id, title, completed }) => ({ id, title, completed })),
        timestamp: new Date().toISOString()
      };
      
      // שליחת הדיווח למערכת
      await sendTasksReport(type, completedTasks, localTasks.length);
      
      console.log(`דיווח על השלמת משימות ${type}:`, reportDetails);
      
      // עדכון ממשק המשתמש
      setIsReported(true);
      toast.success(`הדיווח על השלמת משימות ${type === 'opening' ? 'פתיחה' : 'סגירה'} נשלח בהצלחה!`);
    } catch (error) {
      console.error('שגיאה בשליחת דיווח:', error);
      toast.error('אירעה שגיאה בשליחת הדיווח');
    }
  };
  
  // חישוב התקדמות
  const completedCount = localTasks.filter(task => task.completed).length;
  const progress = localTasks.length > 0 
    ? Math.round((completedCount / localTasks.length) * 100) 
    : 0;
  
  // אם אין משימות, מציג הודעה
  if (!localTasks.length) {
    return <div>אין משימות להצגה</div>;
  }
  
  return (
    <TaskListContainer>
      {localTasks.map((task) => (
        <TaskItem key={task.id}>
          <TaskCheckbox
            type="checkbox"
            checked={task.completed}
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
          הושלמו {completedCount} מתוך {localTasks.length} משימות ({progress}%)
        </ProgressText>
        
        <ReportButton 
          onClick={handleReport} 
          disabled={loading || isReported || completedCount < localTasks.length}
        >
          <FaCheck />
          {isReported ? 'דווח בהצלחה' : 'דווח על השלמת כל המשימות'}
        </ReportButton>
      </ReportButtonContainer>
    </TaskListContainer>
  );
};

export default TaskList;