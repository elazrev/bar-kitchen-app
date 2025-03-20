import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaArrowUp, 
  FaArrowDown,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import { 
  getOpeningTasks, 
  getClosingTasks, 
  addOpeningTask, 
  addClosingTask,
  updateOpeningTask,
  updateClosingTask,
  deleteOpeningTask,
  deleteClosingTask
} from '../../services/api';

const TasksContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TaskTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-left: 0.75rem;
  }
`;

const AddButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: #1e3a6a;
  }
`;

const TaskList = styled.div`
  margin-top: 1rem;
`;

const TaskItem = styled.div`
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: ${props => props.editing ? '#f9f9f9' : 'white'};
`;

const TaskContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TaskInfo = styled.div`
  flex: 1;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.delete ? 'var(--error-color)' : 'var(--primary-color)'};
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  
  &:hover {
    color: ${props => props.delete ? '#d32f2f' : '#1e3a6a'};
  }
`;

const TaskForm = styled.div`
  margin-top: ${props => props.editing ? '1rem' : '0'};
  border-top: ${props => props.editing ? '1px solid var(--light-gray)' : 'none'};
  padding-top: ${props => props.editing ? '1rem' : '0'};
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const SaveButton = styled.button`
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: #3d8b40;
  }
`;

const CancelButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const AdminTaskList = ({ type, icon, title }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    order: 0
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksData = type === 'opening' 
          ? await getOpeningTasks() 
          : await getClosingTasks();
        
        setTasks(tasksData);
        setLoading(false);
      } catch (err) {
        console.error(`שגיאה בטעינת משימות ${type}:`, err);
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [type]);

  const handleAddTask = () => {
    setIsAddingNew(true);
    setNewTask({
      title: '',
      description: '',
      order: tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) + 1 : 0
    });
  };
  
  const handleEditTask = (task) => {
    setEditingTask({ ...task });
  };
  
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
      return;
    }
    
    try {
      if (type === 'opening') {
        await deleteOpeningTask(taskId);
      } else {
        await deleteClosingTask(taskId);
      }
      
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('שגיאה במחיקת משימה:', err);
      alert('אירעה שגיאה במחיקת המשימה. נסה שוב מאוחר יותר.');
    }
  };
  
  const handleMoveTask = async (taskId, direction) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (
      (direction === 'up' && taskIndex === 0) || 
      (direction === 'down' && taskIndex === tasks.length - 1)
    ) {
      return;
    }
    
    const targetIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    const targetTask = tasks[targetIndex];
    const currentTask = tasks[taskIndex];
    
    const updatedTasks = [...tasks];
    
    // החלפה של הסדר בין המשימות
    const tempOrder = currentTask.order;
    currentTask.order = targetTask.order;
    targetTask.order = tempOrder;
    
    // עדכון במערך המקומי
    updatedTasks[taskIndex] = currentTask;
    updatedTasks[targetIndex] = targetTask;
    
    setTasks(updatedTasks.sort((a, b) => a.order - b.order));
    
    // עדכון בבסיס הנתונים
    try {
      if (type === 'opening') {
        await updateOpeningTask(currentTask.id, { order: currentTask.order });
        await updateOpeningTask(targetTask.id, { order: targetTask.order });
      } else {
        await updateClosingTask(currentTask.id, { order: currentTask.order });
        await updateClosingTask(targetTask.id, { order: targetTask.order });
      }
    } catch (err) {
      console.error('שגיאה בעדכון סדר המשימות:', err);
      alert('אירעה שגיאה בשינוי סדר המשימות. נסה שוב מאוחר יותר.');
    }
  };
  
  const handleSaveTask = async () => {
    if (!editingTask.title.trim()) {
      alert('שם המשימה הוא שדה חובה');
      return;
    }
    
    try {
      if (type === 'opening') {
        await updateOpeningTask(editingTask.id, { 
          title: editingTask.title,
          description: editingTask.description
        });
      } else {
        await updateClosingTask(editingTask.id, {
          title: editingTask.title,
          description: editingTask.description
        });
      }
      
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...editingTask } : task
      ));
      
      setEditingTask(null);
    } catch (err) {
      console.error('שגיאה בעדכון המשימה:', err);
      alert('אירעה שגיאה בעדכון המשימה. נסה שוב מאוחר יותר.');
    }
  };
  
  const handleSaveNewTask = async () => {
    if (!newTask.title.trim()) {
      alert('שם המשימה הוא שדה חובה');
      return;
    }
    
    try {
      let addedTask;
      if (type === 'opening') {
        addedTask = await addOpeningTask(newTask);
      } else {
        addedTask = await addClosingTask(newTask);
      }
      
      const taskWithId = { 
        id: addedTask.id, 
        ...newTask 
      };
      
      setTasks([...tasks, taskWithId].sort((a, b) => a.order - b.order));
      setIsAddingNew(false);
      setNewTask({
        title: '',
        description: '',
        order: 0
      });
    } catch (err) {
      console.error('שגיאה בהוספת משימה חדשה:', err);
      alert('אירעה שגיאה בהוספת המשימה. נסה שוב מאוחר יותר.');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingTask(null);
  };
  
  const handleCancelAdd = () => {
    setIsAddingNew(false);
  };

  if (loading) {
    return <LoadingState>טוען משימות...</LoadingState>;
  }

  return (
    <TasksContainer>
      <TaskHeader>
        <TaskTitle>
          {icon}
          {title}
        </TaskTitle>
        <AddButton onClick={handleAddTask}>
          <FaPlus />
          הוסף משימה חדשה
        </AddButton>
      </TaskHeader>
      
      <TaskList>
        {tasks.map((task) => (
          <TaskItem key={task.id} editing={editingTask?.id === task.id}>
            <TaskContent>
              <TaskInfo>
                <h3>{task.title}</h3>
                {task.description && <p>{task.description}</p>}
              </TaskInfo>
              <TaskActions>
                <ActionButton onClick={() => handleMoveTask(task.id, 'up')}>
                  <FaArrowUp />
                </ActionButton>
                <ActionButton onClick={() => handleMoveTask(task.id, 'down')}>
                  <FaArrowDown />
                </ActionButton>
                <ActionButton onClick={() => handleEditTask(task)}>
                  <FaEdit />
                </ActionButton>
                <ActionButton delete onClick={() => handleDeleteTask(task.id)}>
                  <FaTrash />
                </ActionButton>
              </TaskActions>
            </TaskContent>
            
            {editingTask?.id === task.id && (
              <TaskForm editing>
                <FormGroup>
                  <Label>שם המשימה</Label>
                  <Input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>תיאור (אופציונלי)</Label>
                  <Textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  />
                </FormGroup>
                <FormActions>
                  <CancelButton onClick={handleCancelEdit}>
                    <FaTimes />
                    ביטול
                  </CancelButton>
                  <SaveButton onClick={handleSaveTask}>
                    <FaSave />
                    שמור
                  </SaveButton>
                </FormActions>
              </TaskForm>
            )}
          </TaskItem>
        ))}
        
        {isAddingNew && (
          <TaskItem editing>
            <h3>משימה חדשה</h3>
            <TaskForm editing>
              <FormGroup>
                <Label>שם המשימה</Label>
                <Input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>תיאור (אופציונלי)</Label>
                <Textarea
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </FormGroup>
              <FormActions>
                <CancelButton onClick={handleCancelAdd}>
                  <FaTimes />
                  ביטול
                </CancelButton>
                <SaveButton onClick={handleSaveNewTask}>
                  <FaSave />
                  שמור
                </SaveButton>
              </FormActions>
            </TaskForm>
          </TaskItem>
        )}
        
        {tasks.length === 0 && !isAddingNew && (
          <LoadingState>
            אין כרגע משימות מוגדרות. לחץ על "הוסף משימה חדשה" כדי להתחיל.
          </LoadingState>
        )}
      </TaskList>
    </TasksContainer>
  );
};

export default AdminTaskList;