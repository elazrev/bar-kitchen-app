import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const ContentContainer = styled.main`
  flex: 1;
  padding: 1.5rem;
  background-color: var(--background-color);
`;

const Layout = () => {
  return (
    <LayoutContainer>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Navbar />
        <ContentContainer>
          <Outlet />
        </ContentContainer>
      </div>
    </LayoutContainer>
  );
};

export default Layout;