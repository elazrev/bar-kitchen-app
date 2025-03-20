import { useState } from 'react';
import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';
import { useApp } from '../../hooks/useApp';
import { useAuth } from '../../hooks/useAuth';

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
  
  const handleCheckTask = (id, checked) => {
    updateTaskStatus(id, type, checked);
  };
  
  const handleReport = () => {
    const completedTasks = tasks.filter(task => task.completed).length;
    sendTasksReport(type, completedTasks, tasks.length);
    setIsReported(true);
  };
  
  const completedCount = tasks.filter(task => task.completed).length;
  const progress = Math.round((completedCount / tasks.length) * 100) || 0;
  
  return (
    <TaskListContainer>
      {tasks.map((task) => (
        <TaskItem key={task.id}>
          <TaskCheckbox
            type="checkbox"
            checked={task.completed}
            onChange={(e) => handleCheckTask(task.id, e.target.checked)}
            disabled={isReported || (!isAdmin() && task.completedAt)}
          />
          <TaskContent>
            <TaskTitle>{task.title}</TaskTitle>
            {task.description && <TaskDescription>{task.description}</TaskDescription>}
          </TaskContent>
        </TaskItem>
      ))}
      
      <ReportButtonContainer>
        <ProgressText>הושלמו {completedCount} מתוך {tasks.length} משימות ({progress}%)</ProgressText>
        
        <ReportButton 
          onClick={handleReport} 
          disabled={loading || isReported || completedCount < tasks.length}
        >
          <FaCheck />
          {isReported ? 'דווח בהצלחה' : 'דווח על השלמת כל המשימות'}
        </ReportButton>
      </ReportButtonContainer>
    </TaskListContainer>
  );
};

export default TaskList;