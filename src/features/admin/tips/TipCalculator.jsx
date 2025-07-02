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
  margin-top: 2rem;
  background: #fff;
  direction: rtl;
`;

const Th = styled.th`
  text-align: right;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-bottom: 2px solid #e5e7eb;
  border-top: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  font-weight: 700;
  font-size: 1.05em;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  text-align: right;
  font-size: 1em;
`;

const TFoot = styled.tfoot`
  background: #f9fafb;
  font-weight: 700;
  td {
    border-top: 2px solid #e5e7eb;
    font-size: 1.05em;
  }
`;

// עיצוב להדפסה
const PrintStyles = styled.div`
  @media print {
    table, th, td {
      border: 1px solid #888 !important;
      color: #222 !important;
    }
    th {
      background: #eee !important;
      color: #111 !important;
    }
    td, th {
      padding: 0.5rem !important;
      font-size: 1em !important;
    }
    body {
      background: #fff !important;
    }
  }
`;

// פונקציה להצגת מספרים עם שתי ספרות אחרי הנקודה
function formatNumber(num) {
  return Number(num || 0).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TipCalculator = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [cashTips, setCashTips] = useState('');
  const [creditTips, setCreditTips] = useState('');
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
    if (!cashTips || !creditTips || selectedEmployees.some(emp => !emp.hours)) {
      toast.error('נא למלא את כל השדות');
      return;
    }
    
    const parsedCashTips = parseFloat(cashTips);
    const parsedCreditTips = parseFloat(creditTips);
    
    // חישוב סך ההפרשות של כל העובדים
    const totalDeductions = selectedEmployees.reduce((sum, emp) => {
      const hours = parseFloat(emp.hours || 0);
      const employee = employees.find(e => e.id === emp.employeeId);
      const hourlyDeduction = employee?.hourlyDeduction || 20;
      return sum + (hours * hourlyDeduction);
    }, 0);
    
    // חישוב כסף מהקופה
    const cashFromRegister = Math.max(0, parsedCreditTips - totalDeductions);
    
    // חישוב סך הטיפים לחלוקה
    const totalTipsForDistribution = parsedCashTips + cashFromRegister;
    
    const totalHours = selectedEmployees.reduce((sum, emp) => sum + parseFloat(emp.hours || 0), 0);
    
    if (totalHours === 0) {
      toast.error('סך השעות חייב להיות גדול מאפס');
      return;
    }
    
    const calculatedResults = selectedEmployees.map(emp => {
      const hours = parseFloat(emp.hours || 0);
      const ratio = hours / totalHours;
      const exactAmount = totalTipsForDistribution * ratio;
      
      // חישוב הפרשות
      const employee = employees.find(e => e.id === emp.employeeId);
      const hourlyDeduction = employee?.hourlyDeduction || 20;
      const dailyDeduction = hours * hourlyDeduction;
      
      // החסרת הפרשות מהסכום המדויק ואז עיגול
      const exactAmountAfterDeduction = Math.max(0, exactAmount - dailyDeduction);
      const finalTipAmount = Math.floor(exactAmountAfterDeduction);
      const hourlyRate = hours > 0 ? (finalTipAmount / hours) : 0;
      
      return {
        ...emp,
        ratio,
        tipAmount: Math.floor(exactAmount), // סכום לפני הפרשות (לצורך הצגה)
        hourlyDeduction,
        dailyDeduction,
        finalTipAmount,
        hourlyRate
      };
    });
    
    // חישוב היתרה - רק השקלים הבודדים שיצאו מהחישוב בגלל העיגול
    const totalExactAmountAfterDeduction = calculatedResults.reduce((sum, result) => {
      const hours = parseFloat(result.hours || 0);
      const ratio = hours / totalHours;
      const exactAmount = totalTipsForDistribution * ratio;
      const dailyDeduction = hours * (result.hourlyDeduction || 20);
      const exactAmountAfterDeduction = Math.max(0, exactAmount - dailyDeduction);
      return sum + exactAmountAfterDeduction;
    }, 0);
    
    const distributedAmount = calculatedResults.reduce((sum, result) => sum + result.finalTipAmount, 0);
    const newLeftover = totalExactAmountAfterDeduction - distributedAmount;
    
    setResults({
      calculatedResults,
      cashTips: parsedCashTips,
      creditTips: parsedCreditTips,
      totalDeductions,
      cashFromRegister,
      totalTipsForDistribution
    });
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
        cashTips: results.cashTips,
        creditTips: results.creditTips,
        totalDeductions: results.totalDeductions,
        cashFromRegister: results.cashFromRegister,
        totalTipsForDistribution: results.totalTipsForDistribution,
        employees: results.calculatedResults.map(result => ({
          ...result,
          // שמירת כל הנתונים החדשים
          hourlyDeduction: result.hourlyDeduction,
          dailyDeduction: result.dailyDeduction,
          finalTipAmount: result.finalTipAmount,
          hourlyRate: result.hourlyRate
        })),
        leftover: leftover,
        createdBy: user.uid
      };
      
      await tipShiftAPI.saveShift(shiftData);
      
      setSelectedEmployees([]);
      setCashTips('');
      setCreditTips('');
      setResults(null);
      setLeftover(0);
      
      toast.success('המשמרת נשמרה בהצלחה!');
    } catch (err) {
      toast.error('שגיאה בשמירת המשמרת');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetCalculator = () => {
    setSelectedEmployees([]);
    setCashTips('');
    setCreditTips('');
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
            <Label>טיפים במזומן:</Label>
            <Input
              type="number"
              value={cashTips}
              onChange={(e) => setCashTips(e.target.value)}
              placeholder="הכנס סכום..."
              min="0"
              step="1"
            />
          </FormGroup>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <FormGroup>
            <Label>טיפים באשראי:</Label>
            <Input
              type="number"
              value={creditTips}
              onChange={(e) => setCreditTips(e.target.value)}
              placeholder="הכנס סכום..."
              min="0"
              step="1"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>כסף מהקופה (מחושב אוטומטית):</Label>
            <Input
              type="number"
              value={results ? results.cashFromRegister : ''}
              readOnly
              style={{ backgroundColor: '#f9f9f9' }}
              placeholder="יופיע אחרי חישוב..."
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
        <PrintStyles>
          <Card>
            <h2>תוצאות החישוב</h2>
            
            {/* סיכום הטיפים */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '2rem',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>סיכום הטיפים:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>טיפים במזומן:</strong> ₪{formatNumber(results.cashTips)}
                </div>
                <div>
                  <strong>טיפים באשראי:</strong> ₪{formatNumber(results.creditTips)}
                </div>
                <div>
                  <strong>סך הפרשות עובדים:</strong> ₪{formatNumber(results.totalDeductions)}
                </div>
                <div>
                  <strong>כסף מהקופה:</strong> ₪{formatNumber(results.cashFromRegister)}
                </div>
                <div>
                  <strong>סך טיפים לחלוקה:</strong> ₪{formatNumber(results.totalTipsForDistribution)}
                </div>
              </div>
            </div>
            
            {/* סיכום חישובי היתרה */}
            <div style={{ 
              background: '#f0f8ff', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '2rem',
              border: '1px solid #cce5ff'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#004085' }}>חישוב היתרה:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>סך טיפים לחלוקה:</strong> ₪{formatNumber(results.totalTipsForDistribution)}
                </div>
                <div>
                  <strong>סך טיפים אחרי הפרשות (מדויק):</strong> ₪{formatNumber(results.calculatedResults.reduce((sum, emp) => {
                    const hours = parseFloat(emp.hours || 0);
                    const totalHours = results.calculatedResults.reduce((sum, emp) => sum + parseFloat(emp.hours || 0), 0);
                    const ratio = hours / totalHours;
                    const exactAmount = results.totalTipsForDistribution * ratio;
                    const dailyDeduction = hours * (emp.hourlyDeduction || 20);
                    const exactAmountAfterDeduction = Math.max(0, exactAmount - dailyDeduction);
                    return sum + exactAmountAfterDeduction;
                  }, 0))}
                </div>
                <div>
                  <strong>סך תשלומים לעובדים (מעוגל):</strong> ₪{formatNumber(results.calculatedResults.reduce((sum, emp) => sum + emp.finalTipAmount, 0))}
                </div>
                <div style={{ color: '#dc3545', fontWeight: '600' }}>
                  <strong>יתרה שלא חולקה (שקלים בודדים):</strong> ₪{formatNumber(leftover)}
                </div>
              </div>
            </div>
            
            <Table>
              <thead>
                <tr>
                  <Th>שם העובד</Th>
                  <Th>שעות</Th>
                  <Th>אחוז מהסה"כ</Th>
                  <Th>טיפ לפני הפרשה</Th>
                  <Th>הפרשה יומית</Th>
                  <Th>שכר שעתי</Th>
                  <Th>סכום סופי לתשלום</Th>
                </tr>
              </thead>
              <tbody>
                {results.calculatedResults.map((result, index) => (
                  <tr key={index}>
                    <Td>{result.name}</Td>
                    <Td>{formatNumber(result.hours)}</Td>
                    <Td>{(result.ratio * 100).toFixed(1)}%</Td>
                    <Td style={{ color: '#2563eb', fontWeight: '600' }}>₪{formatNumber(result.tipAmount)}</Td>
                    <Td style={{ color: '#dc2626', fontWeight: '600' }}>-₪{formatNumber(result.dailyDeduction)}</Td>
                    <Td style={{ color: '#059669', fontWeight: '600' }}>₪{formatNumber(result.hourlyRate)}</Td>
                    <Td style={{ color: '#7c3aed', fontWeight: '700', fontSize: '1.1em' }}>₪{formatNumber(result.finalTipAmount)}</Td>
                  </tr>
                ))}
              </tbody>
              <TFoot>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right', padding: '1rem', fontWeight: '600' }}>
                    סך תשלומים לעובדים:
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#7c3aed' }}>
                    ₪{formatNumber(results.calculatedResults.reduce((sum, emp) => sum + emp.finalTipAmount, 0))}
                  </td>
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
        </PrintStyles>
      )}
    </CalculatorContainer>
  );
};

export default TipCalculator;