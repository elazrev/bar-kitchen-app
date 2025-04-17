import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaSun, 
  FaBook, 
  FaMoon, 
  FaClipboardList, 
  FaExclamationTriangle,
  FaChartBar,
  FaTimes,
  FaCopyright,
  FaCoins // הוספנו את האייקון החסר
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const SidebarContainer = styled.aside`
  background-color: var(--primary-color);
  color: white;
  width: 240px; /* ערך ברירת מחדל במקרה שהמשתנה לא מוגדר */
  width: var(--sidebar-width, 240px);
  height: 100vh;
  padding: 1.5rem 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
  overflow-y: auto;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    transform: translateX(${props => props.open ? '0' : '100%'});
    width: var(--sidebar-width-mobile, 80%);
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
  flex: 1; /* תופס את רוב המקום בסרגל */
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

const Footer = styled.div`
  padding: 1rem 1.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto; /* דחיפה לתחתית הסרגל */
`;

const CopyrightIcon = styled(FaCopyright)`
  margin: 0 0.3rem;
  font-size: 0.8rem;
`;

const EmailLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

// נוסיף ערכי ברירת מחדל לפרופס כדי למנוע שגיאות
const Sidebar = ({ open = false, onClose = () => {} }) => {
  const { isAdmin } = useAuth();
  const currentYear = new Date().getFullYear();
  
  return (
    <SidebarContainer open={open}>
      <CloseButton onClick={onClose} aria-label="סגור תפריט">
        <FaTimes />
      </CloseButton>
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
            <MenuItem>
              <StyledNavLink to="/tips">
                <FaCoins />
                חישוב טיפים
              </StyledNavLink>
            </MenuItem>
          </>
        )}
      </Menu> 
      
    <Footer>
        <p>
            <span>כל הזכויות שמורות</span> <CopyrightIcon /> <span>{currentYear}</span> 
            <br></br>
            <EmailLink href="mailto:elaz.rev@gmail.com">elaz.rev</EmailLink>
        </p>
    </Footer>
    </SidebarContainer>
  );
};

export default Sidebar;