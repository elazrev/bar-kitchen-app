import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaUsers, 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaUserPlus 
} from 'react-icons/fa';
import { getUsers, addUser, deleteUser, updateUser } from '../../services/api';
import { toast } from 'react-toastify';

const ManagementContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const Title = styled.h2`
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
  padding: 0.6rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: #1e3a6a;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const UserTable = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: right;
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid var(--light-gray);
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid var(--light-gray);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.danger ? 'var(--error-color)' : 'var(--primary-color)'};
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    color: ${props => props.danger ? '#d32f2f' : '#1e3a6a'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  
  @media (max-width: 768px) {
    width: 95%;
    padding: 1.5rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-left: 0.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: var(--error-color);
  }
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SubmitButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: #1e3a6a;
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
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
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

const ConfirmationModal = styled(Modal)``;

const ConfirmationContent = styled(ModalContent)`
  max-width: 400px;
`;

const ConfirmationActions = styled(FormActions)``;

const UserRoleBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background-color: ${props => props.isAdmin ? 'var(--primary-color)' : 'var(--success-color)'};
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('שגיאה בטעינת המשתמשים');
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setNewUser({
      displayName: '',
      email: '',
      phone: '',
    });
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
    
    // נקה שגיאות כשהמשתמש מתקן אותן
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newUser.displayName.trim()) {
      errors.displayName = 'שם מלא הוא שדה חובה';
    }
    
    if (!newUser.email.trim()) {
      errors.email = 'כתובת אימייל היא שדה חובה';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = 'כתובת אימייל לא תקינה';
    }
    
    if (!newUser.phone.trim()) {
      errors.phone = 'מספר טלפון הוא שדה חובה';
    } else if (!/^\d{9,10}$/.test(newUser.phone.replace(/[- ]/g, ''))) {
      errors.phone = 'מספר טלפון לא תקין';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // עיבוד מספר הטלפון - הסרת מקפים ורווחים
      const cleanPhone = newUser.phone.replace(/[- ]/g, '');
      
      const userData = {
        ...newUser,
        phone: cleanPhone,
      };
      
      const newUserData = await addUser(userData);
      setUsers([...users, newUserData]);
      
      setShowModal(false);
      toast.success(`המשתמש ${newUser.displayName} נוסף בהצלחה`);
      setLoading(false);
    } catch (error) {
      console.error('Error adding user:', error);
      
      // טיפול בשגיאות ספציפיות
      if (error.code === 'auth/email-already-in-use') {
        setFormErrors({
          ...formErrors,
          email: 'כתובת האימייל כבר קיימת במערכת',
        });
      } else {
        toast.error('שגיאה בהוספת המשתמש');
      }
      
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      await deleteUser(userToDelete.id);
      
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setShowConfirmation(false);
      setUserToDelete(null);
      
      toast.success('המשתמש נמחק בהצלחה');
      setLoading(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('שגיאה במחיקת המשתמש');
      setLoading(false);
    }
  };

  return (
    <ManagementContainer>
      <Header>
        <Title>
          <FaUsers />
          ניהול משתמשים
        </Title>
        <AddButton onClick={handleOpenModal}>
          <FaUserPlus />
          הוסף משתמש חדש
        </AddButton>
      </Header>
      
      {loading && users.length === 0 ? (
        <EmptyState>טוען משתמשים...</EmptyState>
      ) : users.length > 0 ? (
        <UserTable>
          <Table>
            <thead>
              <tr>
                <Th>שם</Th>
                <Th>אימייל</Th>
                <Th>טלפון</Th>
                <Th>הרשאה</Th>
                <Th>פעולות</Th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <Td>{user.displayName}</Td>
                  <Td>{user.email}</Td>
                  <Td dir="ltr">{user.phone}</Td>
                  <Td>
                    <UserRoleBadge isAdmin={user.role === 'admin'}>
                      {user.role === 'admin' ? 'מנהל' : 'עובד'}
                    </UserRoleBadge>
                  </Td>
                  <Td>
                    <ActionButton danger onClick={() => handleDeleteClick(user)}>
                      <FaTrash />
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </UserTable>
      ) : (
        <EmptyState>אין משתמשים במערכת</EmptyState>
      )}
      
      {/* מודל הוספת משתמש */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                <FaUserPlus />
                הוספת משתמש חדש
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="displayName">שם מלא</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={newUser.displayName}
                  onChange={handleInputChange}
                  placeholder="הכנס שם מלא"
                />
                {formErrors.displayName && (
                  <div style={{ color: 'var(--error-color)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                    {formErrors.displayName}
                  </div>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">כתובת אימייל</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="example@example.com"
                />
                {formErrors.email && (
                  <div style={{ color: 'var(--error-color)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                    {formErrors.email}
                  </div>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="phone">מספר טלפון</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newUser.phone}
                  onChange={handleInputChange}
                  placeholder="050-0000000"
                />
                {formErrors.phone && (
                  <div style={{ color: 'var(--error-color)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                    {formErrors.phone}
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>
                  * מספר הטלפון ישמש כסיסמה ראשונית
                </div>
              </FormGroup>
              
              <FormActions>
                <CancelButton type="button" onClick={handleCloseModal}>
                  <FaTimes />
                  ביטול
                </CancelButton>
                <SubmitButton type="submit" disabled={loading}>
                  <FaSave />
                  {loading ? 'מוסיף...' : 'הוסף משתמש'}
                </SubmitButton>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
      
      {/* מודל אישור מחיקה */}
      {showConfirmation && (
        <ConfirmationModal>
          <ConfirmationContent>
            <ModalHeader>
              <ModalTitle>
                <FaTrash />
                אישור מחיקת משתמש
              </ModalTitle>
              <CloseButton onClick={handleCancelDelete}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <p>
              האם אתה בטוח שברצונך למחוק את המשתמש 
              <strong> {userToDelete?.displayName}</strong>?
            </p>
            <p>פעולה זו אינה הפיכה.</p>
            
            <ConfirmationActions>
              <CancelButton onClick={handleCancelDelete}>
                <FaTimes />
                ביטול
              </CancelButton>
              <SubmitButton onClick={handleConfirmDelete} disabled={loading}>
                <FaTrash />
                {loading ? 'מוחק...' : 'מחק משתמש'}
              </SubmitButton>
            </ConfirmationActions>
          </ConfirmationContent>
        </ConfirmationModal>
      )}
    </ManagementContainer>
  );
};

export default UserManagement;