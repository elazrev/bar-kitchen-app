// src/features/admin/tips/TipEmployeeManagement.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaUserPlus, FaTrash, FaUndo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { tipEmployeeAPI } from '../../../services/api';

const EmployeesContainer = styled.div`
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

const Card = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
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

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const Button = styled.button`
  background-color: ${props => 
    props.danger ? 'var(--error-color)' : 
    props.secondary ? 'var(--secondary-color)' :
    'var(--primary-color)'
  };
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
    background-color: ${props => 
      props.danger ? '#d32f2f' : 
      props.secondary ? '#4267a3' :
      '#1e3a6a'
    };
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  text-align: right;
  padding: 1rem;
  background-color: #f9f9f9;
  border-bottom: 2px solid var(--light-gray);
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid var(--light-gray);
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => props.active ? `
    background-color: #e6f7e6;
    color: #28a745;
  ` : `
    background-color: #feeaea;
    color: #dc3545;
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  font-size: 1.1rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.activate ? '#28a745' : '#dc3545'};
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TipEmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    role: 'waiter',
    hourlyDeduction: 20 
  });
  
  useEffect(() => {
    loadEmployees();
  }, []);
  
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await tipEmployeeAPI.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      toast.error('שגיאה בטעינת העובדים');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!newEmployee.name.trim()) {
      toast.error('יש להזין שם עובד');
      return;
    }
    
    if (!newEmployee.hourlyDeduction || newEmployee.hourlyDeduction <= 0) {
      toast.error('יש להזין הפרשה שעתית תקינה');
      return;
    }
    
    try {
      await tipEmployeeAPI.addEmployee(newEmployee);
      setNewEmployee({ name: '', role: 'waiter', hourlyDeduction: 20 });
      await loadEmployees();
      toast.success('העובד נוסף בהצלחה');
    } catch (err) {
      toast.error('שגיאה בהוספת עובד');
      console.error(err);
    }
  };
  
  const handleDeactivateEmployee = async (employeeId) => {
    if (!window.confirm('האם אתה בטוח שברצונך להשבית עובד זה?')) {
      return;
    }
    
    try {
      await tipEmployeeAPI.deactivateEmployee(employeeId);
      await loadEmployees();
      toast.success('העובד הושבת בהצלחה');
    } catch (err) {
      toast.error('שגיאה בהשבתת עובד');
      console.error(err);
    }
  };
  
  const handleActivateEmployee = async (employeeId) => {
    try {
      await tipEmployeeAPI.updateEmployee(employeeId, { isActive: true });
      await loadEmployees();
      toast.success('העובד הופעל בהצלחה');
    } catch (err) {
      toast.error('שגיאה בהפעלת עובד');
      console.error(err);
    }
  };
  
  if (loading) {
    return <EmptyState>טוען...</EmptyState>;
  }
  
  return (
    <EmployeesContainer>
      <Header>
        <Icon>
          <FaUsers />
        </Icon>
        <Title>ניהול עובדים - טיפים</Title>
      </Header>
      
      <Card>
        <h2>הוספת עובד חדש</h2>
        
        <form onSubmit={handleAddEmployee}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="name">שם העובד</Label>
              <Input
                id="name"
                type="text"
                placeholder="הזן שם עובד"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="role">תפקיד</Label>
              <Select
                id="role"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
              >
                <option value="waiter">מלצר/ית</option>
                <option value="bartender">ברמן/ית</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="hourlyDeduction">הפרשה שעתית (₪)</Label>
              <Input
                id="hourlyDeduction"
                type="number"
                min="0"
                step="1"
                placeholder="20"
                value={newEmployee.hourlyDeduction}
                onChange={(e) => setNewEmployee({ ...newEmployee, hourlyDeduction: parseFloat(e.target.value) || 0 })}
              />
            </FormGroup>
            
            <Button type="submit">
              <FaUserPlus />
              הוסף
            </Button>
          </FormRow>
        </form>
      </Card>
      
      <Card>
        <h2>רשימת עובדים</h2>
        
        {employees.length === 0 ? (
          <EmptyState>אין עובדים במערכת</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>שם</Th>
                <Th>תפקיד</Th>
                <Th>הפרשה שעתית</Th>
                <Th>סטטוס</Th>
                <Th>פעולות</Th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <Td>{employee.name}</Td>
                  <Td>{employee.role === 'waiter' ? 'מלצר/ית' : 'ברמן/ית'}</Td>
                  <Td>₪{employee.hourlyDeduction || 20}</Td>
                  <Td>
                    <StatusBadge active={employee.isActive}>
                      {employee.isActive ? 'פעיל' : 'לא פעיל'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    {employee.isActive ? (
                      <ActionButton
                        onClick={() => handleDeactivateEmployee(employee.id)}
                      >
                        השבת
                      </ActionButton>
                    ) : (
                      <ActionButton
                        activate
                        onClick={() => handleActivateEmployee(employee.id)}
                      >
                        הפעל
                      </ActionButton>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </EmployeesContainer>
  );
};

export default TipEmployeeManagement;