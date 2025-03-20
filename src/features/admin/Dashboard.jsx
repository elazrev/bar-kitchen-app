import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaClipboardList, FaBook, FaMoon, FaSun } from 'react-icons/fa';
import AdminTaskList from './AdminTaskList';
import AdminRecipes from './AdminRecipes';

const DashboardContainer = styled.div`
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

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--light-gray);
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-left: 0.5rem;
  }
`;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('openingTasks');
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'openingTasks':
        return <AdminTaskList type="opening" icon={<FaSun />} title="נהלי פתיחה והכנות" />;
      case 'closingTasks':
        return <AdminTaskList type="closing" icon={<FaMoon />} title="נהלי סגירת מטבח" />;
      case 'recipes':
        return <AdminRecipes />;
      default:
        return null;
    }
  };
  
  return (
    <DashboardContainer>
      <Header>
        <Icon>
          <FaClipboardList />
        </Icon>
        <Title>ניהול תוכן</Title>
      </Header>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'openingTasks'} 
          onClick={() => setActiveTab('openingTasks')}
        >
          <FaSun />
          נהלי פתיחה
        </Tab>
        <Tab 
          active={activeTab === 'closingTasks'} 
          onClick={() => setActiveTab('closingTasks')}
        >
          <FaMoon />
          נהלי סגירה
        </Tab>
        <Tab 
          active={activeTab === 'recipes'} 
          onClick={() => setActiveTab('recipes')}
        >
          <FaBook />
          מתכונים
        </Tab>
      </TabsContainer>
      
      {renderTabContent()}
    </DashboardContainer>
  );
};

export default Dashboard;