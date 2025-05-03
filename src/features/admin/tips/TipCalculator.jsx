// src/features/admin/tips/TipCalculator.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCoins, FaUserPlus, FaTrash, FaUndo, FaCalculator, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { tipEmployeeAPI, tipShiftAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const TipsContainer = styled.div`
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

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  background-color: ${props => 
    props.secondary ? 'var(--secondary-color)' : 
    props.danger ? 'var(--error-color)' : 
    props.success ? 'var(--success-color)' :
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
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: ${props => 
      props.secondary ? '#4267a3' : 
      props.danger ? '#d32f2f' : 
      props.success ? '#3d8b40' :
      '#1e3a6a'
    };
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const StaffList = styled.div`
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const StaffItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: var(--border-radius);
  
  > div:first-child {
    flex: 3;
  }
  
  > div:nth-child(2) {
    flex: 2;
  }
  
  > div:last-child {
    width: 40px;
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
`;

const Th = styled.th`
  text-align: right;
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid var(--light-gray);
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid var(--light-gray);
  
  &.amount {
    font-weight: 600;
    color: var(--primary-color);
  }
`;

const SummaryCard = styled.div`
  background-color: #f9f9f9;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryLabel = styled.div`
  color: #666;
  margin-bottom: 0.5rem;
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.accent ? 'var(--accent-color)' : 'var(--primary-color)'};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TipCalculator = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([{ id: 1, employeeId: '', name: '', hours: '' }]);
  const [totalTips, setTotalTips] = useState('');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  const availableEmployees = employees.filter(emp => 
    !selectedEmployees.some(selected => selected.employeeId === emp.id)
  );
  
  useEffect(() => {
    loadActiveEmployees();
  }, []);
  
  const loadActiveEmployees = async () => {
    try {
      console.log('Starting to load active employees...');
      const data = await tipEmployeeAPI.getActiveEmployees();
      console.log('Received employees data:', data);
      
      if (!data || data.length === 0) {
        console.log('No employees found');
        toast.warning('לא נמצאו עובדים פעילים במערכת');
      }
      
      setEmployees(data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      toast.error('שגיאה בטעינת רשימת העובדים: ' + err.message);
    }
  };
  
  const addStaffMember = () => {
    const newId = selectedEmployees.length > 0 
      ? Math.max(...selectedEmployees.map(s => s.id)) + 1 
      : 1;
    
    setSelectedEmployees([
      ...selectedEmployees,
      { id: newId, employeeId: '', name: '', hours: '' }
    ]);
  };
  
  const removeStaffMember = (id) => {
    if (selectedEmployees.length <= 1) {
      toast.warning('חייב להישאר לפחות עובד אחד');
      return;
    }
    
    setSelectedEmployees(selectedEmployees.filter(staff => staff.id !== id));
  };
  
  const updateStaffMember = (id, field, value) => {
    if (field === 'employeeId') {
      const employee = employees.find(emp => emp.id === value);
      setSelectedEmployees(selectedEmployees.map(staff => 
        staff.id === id ? { ...staff, employeeId: value, name: employee?.name || '' } : staff
      ));
    } else {
      setSelectedEmployees(selectedEmployees.map(staff => 
        staff.id === id ? { ...staff, [field]: value } : staff
      ));
    }
  };
  
  const clearAll = () => {
    setSelectedEmployees([{ id: 1, employeeId: '', name: '', hours: '' }]);
    setTotalTips('');
    setResults(null);
  };
  
  const calculateTips = () => {
    const missingData = selectedEmployees.some(staff => !staff.employeeId || !staff.hours);
    if (missingData) {
      toast.error('יש למלא את כל העובדים ושעות העבודה');
      return;
    }
    
    if (!totalTips || isNaN(parseFloat(totalTips)) || parseFloat(totalTips) <= 0) {
      toast.error('יש להזין סכום טיפים תקין');
      return;
    }
    
    const tipsAmount = parseFloat(totalTips);
    
    const staff = selectedEmployees.map(member => ({
      ...member,
      hours: parseFloat(member.hours)
    }));
    
    const totalHours = staff.reduce((sum, member) => sum + member.hours, 0);
    
    let calculatedResults = staff.map(member => {
      const ratio = member.hours / totalHours;
      const exactAmount = tipsAmount * ratio;
      const roundedAmount = Math.floor(exactAmount);
      const tipPerHour = roundedAmount / member.hours; // חישוב טיפ לשעה
      
      return {
        ...member,
        ratio,
        exactAmount,
        roundedAmount,
        tipPerHour
      };
    });
    
    const totalDistributed = calculatedResults.reduce(
      (sum, result) => sum + result.roundedAmount, 
      0
    );
    
    const remainder = tipsAmount - totalDistributed;
    
    setResults({
      staffResults: calculatedResults,
      totalHours,
      totalTips: tipsAmount,
      totalDistributed,
      remainder
    });
    
    toast.success('החישוב בוצע בהצלחה');
  };
  
  const saveShift = async () => {
    if (!results) return;
    
    try {
      setLoading(true);
      
      const shiftData = {
        date: new Date(shiftDate),
        totalTips: parseFloat(totalTips),
        employees: results.staffResults.map(result => ({
          employeeId: result.employeeId,
          name: result.name,
          hours: result.hours,
          tipAmount: result.roundedAmount,
          tipPerHour: result.tipPerHour, // הוספת טיפ לשעה לנתונים שנשמרים
          ratio: result.ratio
        })),
        leftover: results.remainder,
        createdBy: user.uid
      };
      
      await tipShiftAPI.saveShift(shiftData);
      
      toast.success('המשמרת נשמרה בהצלחה!');
      clearAll();
    } catch (err) {
      toast.error('שגיאה בשמירת המשמרת');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <TipsContainer>
      <Header>
        <Icon>
          <FaCoins />
        </Icon>
        <Title>חישוב טיפים</Title>
      </Header>
      
      <Card>
        <h2>הזן את פרטי המשמרת</h2>
        
        <FormRow>
          <FormGroup>
            <Label>תאריך משמרת</Label>
            <Input
              type="date"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>סכום טיפים כולל</Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={totalTips}
              onChange={(e) => setTotalTips(e.target.value)}
              placeholder="הזן את הסכום הכולל בשקלים"
            />
          </FormGroup>
        </FormRow>
        
        <ButtonRow>
          <Button onClick={addStaffMember} secondary>
            <FaUserPlus />
            הוסף עובד
          </Button>
          <Button onClick={clearAll} danger>
            <FaUndo />
            נקה הכל
          </Button>
        </ButtonRow>
        
        <StaffList>
    <h3>רשימת עובדים במשמרת</h3>
    {selectedEmployees.map((staff) => (
      <StaffItem key={staff.id}>
        <div>
          {staff.name ? (
            <Input
              type="text"
              value={staff.name}
              disabled
              style={{ backgroundColor: '#f9f9f9' }}
            />
          ) : (
            <Select
              value={staff.employeeId}
              onChange={(e) => updateStaffMember(staff.id, 'employeeId', e.target.value)}
            >
              <option value="">בחר עובד</option>
              {availableEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role === 'waiter' ? 'מלצר/ית' : 'ברמן/ית'})
                </option>
              ))}
            </Select>
          )}
        </div>
        <div>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={staff.hours}
            onChange={(e) => updateStaffMember(staff.id, 'hours', e.target.value)}
            placeholder="שעות עבודה"
          />
        </div>
        <div>
          <Button 
            danger 
            onClick={() => removeStaffMember(staff.id)}
            style={{ padding: '0.5rem', width: '40px', justifyContent: 'center' }}
          >
            <FaTrash />
          </Button>
        </div>
      </StaffItem>
    ))}
  </StaffList>
        
        <Button onClick={calculateTips}>
          <FaCalculator />
          חשב טיפים
        </Button>
        
        {results && (
          <>
            <ResultsTable>
              <thead>
                <tr>
                  <Th>שם העובד</Th>
                  <Th>שעות עבודה</Th>
                  <Th>יחס</Th>
                  <Th>סכום מדויק</Th>
                  <Th>סכום לתשלום</Th>
                  <Th>טיפ לשעה</Th>
                </tr>
              </thead>
              <tbody>
                {results.staffResults.map((result) => (
                  <tr key={result.id}>
                    <Td>{result.name}</Td>
                    <Td>{result.hours}</Td>
                    <Td>{(result.ratio * 100).toFixed(1)}%</Td>
                    <Td>₪{result.exactAmount.toFixed(2)}</Td>
                    <Td className="amount">₪{result.roundedAmount}</Td>
                    <Td>₪{result.tipPerHour.toFixed(2)}</Td>
                  </tr>
                ))}
              </tbody>
            </ResultsTable>
            
            <SummaryCard>
              <SummaryItem>
                <SummaryLabel>סה"כ שעות</SummaryLabel>
                <SummaryValue>{results.totalHours}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>סה"כ טיפים</SummaryLabel>
                <SummaryValue>₪{results.totalTips}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>סה"כ חולק</SummaryLabel>
                <SummaryValue>₪{results.totalDistributed}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>יתרה לטיפים מחר</SummaryLabel>
                <SummaryValue accent>₪{results.remainder}</SummaryValue>
              </SummaryItem>
            </SummaryCard>
            
            <ButtonRow style={{ marginTop: '2rem', justifyContent: 'center' }}>
              <Button onClick={saveShift} success disabled={loading}>
                <FaSave />
                {loading ? 'שומר...' : 'שמור משמרת'}
              </Button>
            </ButtonRow>
          </>
        )}
      </Card>
    </TipsContainer>
  );
};

export default TipCalculator;