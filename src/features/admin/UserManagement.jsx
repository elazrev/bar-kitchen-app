import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUserPlus, FaUser, FaPhone, FaEnvelope, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getUsers, addNewUser, deleteUser } from '../../services/api';

const UsersContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
`;

const UsersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const UsersTitle = styled.h2`
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
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.75rem;
    justify-content: center;
  }
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const UserCard = styled.div`
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  position: relative;
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const UserIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-left: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  margin: 0;
  margin-bottom: 0.25rem;
`;

const UserRole = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const UserDetail = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  
  svg {
    margin-left: 0.5rem;
    color: var(--primary-color);
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    color: #d32f2f;
  }
`;

const NewUserForm = styled.div`
  background-color: #f9f9f9;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FormTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-left: 0.5rem;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
`;

const SaveButton = styled.button`
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: #3d8b40;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CancelButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: #d32f2f;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת משתמשים:', err);
        toast.error('אירעה שגיאה בטעינת המשתמשים');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setNewUser({
      displayName: '',
      email: '',
      phone: ''
    });
  };

  const handleCancel = () => {
    setIsAddingNew(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!newUser.displayName.trim()) {
      toast.error('יש להזין שם מלא');
      return false;
    }
    
    if (!newUser.email.trim() || !/\S+@\S+\.\S+/.test(newUser.email)) {
      toast.error('יש להזין כתובת אימייל תקינה');
      return false;
    }
    
    if (!newUser.phone.trim() || newUser.phone.length < 9) {
      toast.error('יש להזין מספר טלפון תקין');
      return false;
    }
    
    // בדיקה אם המשתמש כבר קיים
    if (users.some(user => user.email === newUser.email)) {
      toast.error('משתמש עם כתובת אימייל זו כבר קיים במערכת');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const newUserData = {
        ...newUser,
        role: 'staff', // כל המשתמשים החדשים הם עובדים רגילים
        password: newUser.phone // הסיסמה הראשונית היא מספר הטלפון
      };
      
      await addNewUser(newUserData);
      
      // רענון רשימת המשתמשים
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      
      toast.success(`המשתמש ${newUser.displayName} נוסף בהצלחה`);
      setIsAddingNew(false);
      setLoading(false);
    } catch (err) {
      console.error('שגיאה בהוספת משתמש חדש:', err);
      toast.error('אירעה שגיאה בהוספת המשתמש');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${userName}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteUser(userId);
      
      // עדכון רשימת המשתמשים המקומית
      setUsers(users.filter(user => user.id !== userId));
      
      toast.success(`המשתמש ${userName} נמחק בהצלחה`);
      setLoading(false);
    } catch (err) {
      console.error('שגיאה במחיקת משתמש:', err);
      toast.error('אירעה שגיאה במחיקת המשתמש');
      setLoading(false);
    }
  };

  return (
    <UsersContainer>
      <UsersHeader>
        <UsersTitle>
          <FaUser />
          ניהול משתמשים
        </UsersTitle>
        <AddButton onClick={handleAddNewClick}>
          <FaUserPlus />
          הוסף עובד חדש
        </AddButton>
      </UsersHeader>
      
      {isAddingNew && (
        <NewUserForm>
          <FormTitle>
            <FaUserPlus />
            הוספת עובד חדש
          </FormTitle>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="displayName">שם מלא</Label>
              <Input
                id="displayName"
                name="displayName"
                value={newUser.displayName}
                onChange={handleInputChange}
                placeholder="ישראל ישראלי"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="email">כתובת אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
                placeholder="israel@example.com"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="phone">מספר טלפון</Label>
              <Input
                id="phone"
                name="phone"
                value={newUser.phone}
                onChange={handleInputChange}
                placeholder="0501234567"
              />
            </FormGroup>
          </FormGrid>
          <FormActions>
            <CancelButton onClick={handleCancel}>
              <FaTimes />
              ביטול
            </CancelButton>
            <SaveButton onClick={handleSubmit} disabled={loading}>
              <FaSave />
              {loading ? 'מוסיף...' : 'הוסף משתמש'}
            </SaveButton>
          </FormActions>
        </NewUserForm>
      )}
      
      {loading && users.length === 0 ? (
        <EmptyState>טוען משתמשים...</EmptyState>
      ) : users.length > 0 ? (
        <UsersGrid>
          {users.map(user => (
            <UserCard key={user.id}>
              <UserHeader>
                <UserIcon>
                  <FaUser />
                </UserIcon>
                <UserInfo>
                  <UserName>{user.displayName}</UserName>
                  <UserRole>{user.role === 'admin' ? 'מנהל' : 'עובד מטבח'}</UserRole>
                </UserInfo>
              </UserHeader>
              <UserDetail>
                <FaEnvelope />
                {user.email}
              </UserDetail>
              {user.phone && (
                <UserDetail>
                  <FaPhone />
                  {user.phone}
                </UserDetail>
              )}
              {user.role !== 'admin' && (
                <DeleteButton 
                  onClick={() => handleDeleteUser(user.id, user.displayName)}
                  title="מחק משתמש"
                >
                  <FaTrash />
                </DeleteButton>
              )}
            </UserCard>
          ))}
        </UsersGrid>
      ) : (
        <EmptyState>אין משתמשים להצגה. לחץ על "הוסף עובד חדש" כדי להתחיל.</EmptyState>
      )}
    </UsersContainer>
  );
};

export default AdminUsers;