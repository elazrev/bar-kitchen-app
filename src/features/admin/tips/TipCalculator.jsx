import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCoins, FaSave, FaTrash, FaPlus, FaCalculator } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { tipEmployeeAPI, tipShiftAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const CalculatorContainer = styled.div`
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
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const EmployeeList = styled.div`
  margin-top: 1rem;
`;

const EmployeeCard = styled.div`
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: #d32f2f;
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

const TFoot = styled.tfoot`
  background-color: #f9f9f9;
  font-weight: 600;
`;

const TipCalculator = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [totalTips, setTotalTips] = useState('');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState(null);
  const [leftover, setLeftover] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadActiveEmployees();
  }, []);

  const loadActiveEmployees = async () => {
    try {
      const data = await tipEmployeeAPI.getActiveEmployees();
      setEmployees(data);
    } catch (err) {
      toast.error('שגיאה בטעינת רשימת העובדים');
      console.error(err);
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setSelectedEmployees([...selectedEmployees, {
        employeeId: employee.id,
        name: employee.name,
        hours: '',
      }]);
    }
  };

  const handleHoursChange = (index, hours) => {
    const newSelectedEmployees = [...selectedEmployees];
    newSelectedEmployees[index].hours = hours;
    setSelectedEmployees(newSelectedEmployees);
  };

  const removeSelectedEmployee = (index) => {
    const newSelectedEmployees = [...selectedEmployees];
    newSelectedEmployees.splice(index, 1);
    setSelectedEmployees(newSelectedEmployees);
  };

  const calculateTips = async () => {
    if (!totalTips || selectedEmployees.some(emp => !emp.hours)) {
      toast.error('נא למלא את כל השדות');
      return;
    }
    
    const parsedTotalTips = parseFloat(totalTips);
    const totalHours = selectedEmployees.reduce((sum, emp) => sum + parseFloat(emp.hours || 0), 0);
    
    if (totalHours === 0) {
      toast.error('סך השעות חייב להיות גדול מאפס');
      return;
    }
    
    const calculatedResults = selectedEmployees.map(emp => {
      const hours = parseFloat(emp.hours || 0);
      const ratio = hours / totalHours;
      const exactAmount = parsedTotalTips * ratio;
      const roundedAmount = Math.floor(exactAmount);
      
      return {
        ...emp,
        ratio,
        tipAmount: roundedAmount
      };
    });
    
    const distributedAmount = calculatedResults.reduce((sum, result) => sum + result.tipAmount, 0);
    const newLeftover = parsedTotalTips - distributedAmount;
    
    setResults(calculatedResults);
    setLeftover(newLeftover);
  };
  
  const checkExistingShift = async (date) => {
    try {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const shifts = await tipShiftAPI.getShiftsByDateRange(dayStart, dayEnd);
      return shifts.length > 0;
    } catch (error) {
      console.error('Error checking existing shift:', error);
      return false;
    }
  };
  
  const saveShift = async () => {
    if (!results) return;
    
    try {
      setLoading(true);
      
      // בדיקה אם קיים כבר דוח לתאריך זה
      const dayStart = new Date(shiftDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(shiftDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const existingShifts = await tipShiftAPI.getShiftsByDateRange(dayStart, dayEnd);
      
      if (existingShifts.length > 0) {
        toast.error('דוח טיפים של יום זה קיים, נא לערוך דרך הארכיון');
        return;
      }
      
      const shiftData = {
        date: new Date(shiftDate),
        totalTips: parseFloat(totalTips),
        employees: results,
        leftover: leftover,
        createdBy: user.uid
      };
      
      await tipShiftAPI.saveShift(shiftData);
      
      setSelectedEmployees([]);
      setTotalTips('');
      setResults(null);
      setLeftover(0);
      setError(null);
      
      toast.success('המשמרת נשמרה בהצלחה!');
    } catch (err) {
      setError('שגיאה בשמירת המשמרת');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetCalculator = () => {
    setSelectedEmployees([]);
    setTotalTips('');
    setResults(null);
    setLeftover(0);
  };

  const availableEmployees = employees.filter(emp => 
    !selectedEmployees.some(selected => selected.employeeId === emp.id)
  );

  return (
    <CalculatorContainer>
      <Header>
        <Icon>
          <FaCalculator />
        </Icon>
        <Title>מחשבון טיפים</Title>
      </Header>
      
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <FormGroup>
            <Label>תאריך משמרת:</Label>
            <Input
              type="date"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>סכום טיפים כולל לחלוקה:</Label>
            <Input
              type="number"
              value={totalTips}
              onChange={(e) => setTotalTips(e.target.value)}
              placeholder="הכנס סכום..."
              min="0"
              step="1"
            />
          </FormGroup>
        </div>
        
        <FormGroup>
          <Label>הוסף עובד למשמרת:</Label>
          {availableEmployees.length > 0 ? (
            <Select
              onChange={(e) => {
                if (e.target.value) {
                  handleEmployeeSelect(e.target.value);
                  e.target.value = '';
                }
              }}
              value=""
            >
              <option value="">בחר עובד להוספה...</option>
              {availableEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role === 'waiter' ? 'מלצר/ית' : 'ברמן/ית'})
                </option>
              ))}
            </Select>
          ) : (
            <p>כל העובדים כבר נוספו למשמרת</p>
          )}
        </FormGroup>
        
        {selectedEmployees.length > 0 && (
          <EmployeeList>
            <h3>עובדים במשמרת:</h3>
            {selectedEmployees.map((emp, index) => (
              <EmployeeCard key={emp.employeeId}>
                <div style={{ flex: 1 }}>
                  <strong>{emp.name}</strong>
                </div>
                <Input
                  type="number"
                  value={emp.hours}
                  onChange={(e) => handleHoursChange(index, e.target.value)}
                  placeholder="שעות עבודה"
                  min="0"
                  step="0.5"
                  style={{ width: '150px' }}
                />
                <RemoveButton onClick={() => removeSelectedEmployee(index)}>
                  <FaTrash />
                </RemoveButton>
              </EmployeeCard>
            ))}
          </EmployeeList>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Button onClick={calculateTips}>
            חשב טיפים
          </Button>
          
          <Button secondary onClick={resetCalculator}>
            נקה הכל
          </Button>
        </div>
      </Card>
      
      {results && (
        <Card>
          <h2>תוצאות החישוב</h2>
          
          <Table>
            <thead>
              <tr>
                <Th>שם העובד</Th>
                <Th>שעות</Th>
                <Th>אחוז מהסה"כ</Th>
                <Th>סכום לתשלום (₪)</Th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <Td>{result.name}</Td>
                  <Td>{result.hours}</Td>
                  <Td>{(result.ratio * 100).toFixed(1)}%</Td>
                  <Td>{result.tipAmount} ₪</Td>
                </tr>
              ))}
            </tbody>
            <TFoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', padding: '1rem' }}>יתרה שלא חולקה:</td>
                <td style={{ padding: '1rem' }}>{leftover.toFixed(2)} ₪</td>
              </tr>
            </TFoot>
          </Table>
          
          {leftover > 0 && (
            <p style={{ marginTop: '1rem', color: '#666' }}>
              * היתרה תועבר לטיפים של יום המחרת
            </p>
          )}
          
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Button onClick={saveShift} disabled={loading}>
              <FaSave />
              {loading ? 'שומר...' : 'שמור משמרת'}
            </Button>
          </div>
        </Card>
      )}
    </CalculatorContainer>
  );
};

export default TipCalculator;