import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaSun, 
  FaBook, 
  FaMoon, 
  FaClipboardList, 
  FaExclamationTriangle,
  FaChartBar
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const SidebarContainer = styled.aside`
  background-color: var(--primary-color);
  color: white;
  width: 240px;
  min-height: 100vh;
  padding: 1.5rem 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1.5rem;
`;

const Menu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  margin-bottom: 0.5rem;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: white;
  opacity: 0.8;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    opacity: 1;
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
    opacity: 1;
    font-weight: 500;
  }
  
  svg {
    margin-left: 0.75rem;
    font-size: 1.25rem;
  }
`;

const Sidebar = () => {
  const { isAdmin } = useAuth();
  
  return (
    <SidebarContainer>
      <Logo>מטבח הבר</Logo>
      <Menu>
        <MenuItem>
          <StyledNavLink to="/opening">
            <FaSun />
            נהלי פתיחה
          </StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/recipes">
            <FaBook />
            מתכונים
          </StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/closing">
            <FaMoon />
            נהלי סגירה
          </StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/shortage">
            <FaExclamationTriangle />
            דיווח חוסרים
          </StyledNavLink>
        </MenuItem>
        
        {isAdmin() && (
          <>
            <MenuItem>
              <StyledNavLink to="/admin">
                <FaClipboardList />
                ניהול תוכן
              </StyledNavLink>
            </MenuItem>
            <MenuItem>
              <StyledNavLink to="/reports">
                <FaChartBar />
                דוחות
              </StyledNavLink>
            </MenuItem>
          </>
        )}
      </Menu>
    </SidebarContainer>
  );
};

export default Sidebar;