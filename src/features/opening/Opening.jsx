import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaClipboardCheck } from 'react-icons/fa';
import { getOpeningTasks } from '../../services/api';
import TaskList from '../../components/shared/TaskList';
import { useApp } from '../../hooks/useApp';

const OpeningContainer = styled.div`
  padding: 2rem 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  margin-right: 0.75rem;
`;

const Icon = styled.div`
  font-size: 2rem;
  color: var(--primary-color);
`;

const Card = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
`;

const CardHeader = styled.div`
  border-bottom: 1px solid var(--light-gray);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const Opening = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { startOpeningTasks } = useApp();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksData = await getOpeningTasks();
        setTasks(tasksData);
        startOpeningTasks(tasksData);
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת משימות פתיחה:', err);
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [startOpeningTasks]);

  return (
    <OpeningContainer>
      <Header>
        <Icon>
          <FaClipboardCheck />
        </Icon>
        <Title>נהלי פתיחה והכנות</Title>
      </Header>
      
      <Card>
        <CardHeader>
          <CardTitle>משימות לפתיחת המטבח</CardTitle>
        </CardHeader>
        
        {loading ? (
          <LoadingState>טוען משימות...</LoadingState>
        ) : tasks.length > 0 ? (
          <TaskList tasks={tasks} type="opening" />
        ) : (
          <LoadingState>לא נמצאו משימות פתיחה.</LoadingState>
        )}
      </Card>
    </OpeningContainer>
  );
};

export default Opening;