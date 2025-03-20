import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSignOutAlt, FaBell } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../hooks/useApp';

const NavbarContainer = styled.nav`
  background-color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserName = styled.span`
  font-weight: 500;
  margin-left: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-color);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--accent-color);
  color: white;
  font-size: 0.75rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { shortages } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goToShortages = () => {
    navigate('/shortage');
  };

  return (
    <NavbarContainer>
      <UserInfo>
        <UserName>שלום, {user?.displayName || 'משתמש'}</UserName>
      </UserInfo>
      <ActionButtons>
        <IconButton onClick={goToShortages}>
          <FaBell />
          {shortages.length > 0 && <NotificationBadge>{shortages.length}</NotificationBadge>}
        </IconButton>
        <IconButton onClick={handleLogout}>
          <FaSignOutAlt />
        </IconButton>
      </ActionButtons>
    </NavbarContainer>
  );
};

export default Navbar;