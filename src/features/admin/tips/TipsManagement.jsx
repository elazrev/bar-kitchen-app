// src/features/admin/tips/TipsManagement.jsx
import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaCoins, FaUsers, FaChartBar, FaArrowRight } from 'react-icons/fa';
import TipEmployeeManagement from './TipEmployeeManagement';
import TipCalculator from './TipCalculator';
import TipArchive from './TipArchive';
import { useAuth } from '../../../hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../../../services/api';

const ManagementContainer = styled.div`
  padding: 2rem 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
`;

const Icon = styled.div`
  font-size: 2rem;
  color: var(--primary-color);
  margin-left: 0.75rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  background-color: #6c757d;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-size: 1rem;
  
  &:hover {
    background-color: #5a6268;
  }
  
  svg {
    margin-left: 0.5rem;
  }
`;

const NavTabs = styled.nav`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1rem;
  margin-bottom: 2rem;
`;

const TabList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TabItem = styled.li``;

const TabLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  background-color: ${props => props.active ? 'var(--primary-color)' : '#f9f9f9'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : '#e9ecef'};
  }
  
  svg {
    margin-left: 0.5rem;
  }
`;

const ContentArea = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  min-height: 60vh;
`;

const TipsManagement = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // בדיקת הרשאות
  if (!user || 
      (!hasPermission(user.role, PERMISSIONS.MANAGE_TIPS) && 
       !hasPermission(user.role, PERMISSIONS.VIEW_TIP_REPORTS) && 
       !hasPermission(user.role, PERMISSIONS.MANAGE_EMPLOYEES))) {
    return <Navigate to="/admin" replace />;
  }

  const navigationItems = [
    {
      title: 'מחשבון טיפים',
      path: '/admin/tips/calculator',
      icon: <FaCoins />,
      permission: PERMISSIONS.MANAGE_TIPS
    },
    {
      title: 'ניהול עובדים',
      path: '/admin/tips/employees',
      icon: <FaUsers />,
      permission: PERMISSIONS.MANAGE_EMPLOYEES
    },
    {
      title: 'ארכיון ודוחות',
      path: '/admin/tips/archive',
      icon: <FaChartBar />,
      permission: PERMISSIONS.VIEW_TIP_REPORTS
    }
  ];

  // סינון פריטי ניווט לפי הרשאות
  const filteredNavItems = navigationItems.filter(item => 
    hasPermission(user.role, item.permission)
  );

  return (
    <ManagementContainer>
      <Header>
        <TitleSection>
          <Icon>
            <FaCoins />
          </Icon>
          <Title>ניהול טיפים</Title>
        </TitleSection>
        <BackButton to="/admin">
          <FaArrowRight />
          חזרה לניהול ראשי
        </BackButton>
      </Header>

      <NavTabs>
        <TabList>
          {filteredNavItems.map((item) => (
            <TabItem key={item.path}>
              <TabLink
                to={item.path}
                active={location.pathname === item.path}
              >
                {item.icon}
                {item.title}
              </TabLink>
            </TabItem>
          ))}
        </TabList>
      </NavTabs>

      <ContentArea>
        <Routes>
          <Route 
            path="calculator" 
            element={
              hasPermission(user.role, PERMISSIONS.MANAGE_TIPS) ? 
                <TipCalculator /> : 
                <Navigate to="/admin/tips" replace />
            } 
          />
          <Route 
            path="employees" 
            element={
              hasPermission(user.role, PERMISSIONS.MANAGE_EMPLOYEES) ? 
                <TipEmployeeManagement /> : 
                <Navigate to="/admin/tips" replace />
            } 
          />
          <Route 
            path="archive" 
            element={
              hasPermission(user.role, PERMISSIONS.VIEW_TIP_REPORTS) ? 
                <TipArchive /> : 
                <Navigate to="/admin/tips" replace />
            } 
          />
          <Route index element={<Navigate to="calculator" replace />} />
        </Routes>
      </ContentArea>
    </ManagementContainer>
  );
};

export default TipsManagement;