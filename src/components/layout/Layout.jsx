import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styled from 'styled-components';
import { FaBars } from 'react-icons/fa';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
`;

const ContentContainer = styled.main`
  flex: 1;
  padding: var(--content-padding);
  background-color: var(--background-color);
  
  @media (max-width: 768px) {
    padding: var(--content-padding-mobile);
    width: 100%;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: margin-right 0.3s ease;
  
  @media (min-width: 769px) {
    margin-right: var(--sidebar-width);
  }
  
  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  
  @media (max-width: 768px) {
    display: ${props => props.show ? 'block' : 'none'};
  }
`;

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <LayoutContainer>
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <Overlay show={sidebarOpen} onClick={closeSidebar} />
      <MainContent>
        <Navbar />
        <ContentContainer onClick={closeSidebar}>
          <Outlet />
        </ContentContainer>
      </MainContent>
      <MobileMenuButton onClick={toggleSidebar} aria-label="תפריט">
        <FaBars />
      </MobileMenuButton>
    </LayoutContainer>
  );
};

export default Layout;