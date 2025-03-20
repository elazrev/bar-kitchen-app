import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaSun, 
  FaBook, 
  FaMoon, 
  FaClipboardList, 
  FaExclamationTriangle,
  FaChartBar,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const SidebarContainer = styled.aside`
  background-color: var(--primary-color);
  color: white;
  width: var(--sidebar-width);
  height: 100vh;
  padding: 1.5rem 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
  overflow-y: auto;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    transform: translateX(${props => props.open ? '0' : '100%'});
    width: var(--sidebar-width-mobile);
  }
`;

const CloseButton = styled.button`
  display: none;
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    padding-top: 1rem;
  }
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
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem; /* פדינג גדול יותר במובייל לנוחות לחיצה */
  }
`;

const Sidebar = ({ open, onClose }) => {
  const { isAdmin } = useAuth();
  
  return (
    <SidebarContainer open={open}>
      <CloseButton onClick={onClose} aria-label="סגור תפריט">
        <FaTimes />
      </CloseButton>
      <Logo>מטבח הבר</Logo>
      <Menu>
        <MenuItem>
          <StyledNavLink to="/opening" onClick={onClose}>
            <FaSun />
            נהלי פתיחה
          </StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/recipes" onClick={onClose}>
            <FaBook />
            מתכונים
          </StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/closing" onClick={onClose}>
            <FaMoon />
            נהלי סגירה
          </StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/shortage" onClick={onClose}>
            <FaExclamationTriangle />
            דיווח חוסרים
          </StyledNavLink>
        </MenuItem>
        
        {isAdmin() && (
          <>
            <MenuItem>
              <StyledNavLink to="/admin" onClick={onClose}>
                <FaClipboardList />
                ניהול תוכן
              </StyledNavLink>
            </MenuItem>
            <MenuItem>
              <StyledNavLink to="/reports" onClick={onClose}>
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