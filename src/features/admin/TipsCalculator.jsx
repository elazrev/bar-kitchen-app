import { useState } from 'react';
import styled from 'styled-components';
import { FaCoins, FaUserPlus, FaTrash, FaUndo, FaCalculator } from 'react-icons/fa';
import { toast } from 'react-toastify';

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

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  background-color: ${props => props.secondary ? 'var(--secondary-color)' : props.danger ? 'var(--error-color)' : 'var(--primary-color)'};
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
      '#1e3a6a'
    };
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

const TipsCalculator = () => {
  const [staffMembers, setStaffMembers] = useState([
    { id: 1, name: '', hours: '' }
  ]);
  const [totalTips, setTotalTips] = useState('');
  const [results, setResults] = useState(null);
  
  // הוספת עובד חדש
  const addStaffMember = () => {
    const newId = staffMembers.length > 0 
      ? Math.max(...staffMembers.map(s => s.id)) + 1 
      : 1;
    
    setStaffMembers([
      ...staffMembers,
      { id: newId, name: '', hours: '' }
    ]);
  };
  
  // הסרת עובד
  const removeStaffMember = (id) => {
    if (staffMembers.length <= 1) {
      toast.warning('חייב להישאר לפחות עובד אחד');
      return;
    }
    
    setStaffMembers(staffMembers.filter(staff => staff.id !== id));
  };
  
  // עדכון פרטי עובד
  const updateStaffMember = (id, field, value) => {
    setStaffMembers(staffMembers.map(staff => 
      staff.id === id ? { ...staff, [field]: value } : staff
    ));
  };
  
  // ניקוי כל הנתונים
  const clearAll = () => {
    setStaffMembers([{ id: 1, name: '', hours: '' }]);
    setTotalTips('');
    setResults(null);
  };
  
  // חישוב חלוקת הטיפים
  const calculateTips = () => {
    // וידוא שכל השדות מלאים
    const missingData = staffMembers.some(staff => !staff.name || !staff.hours);
    if (missingData) {
      toast.error('יש למלא את כל שמות העובדים ושעות העבודה');
      return;
    }
    
    if (!totalTips || isNaN(parseFloat(totalTips)) || parseFloat(totalTips) <= 0) {
      toast.error('יש להזין סכום טיפים תקין');
      return;
    }
    
    const tipsAmount = parseFloat(totalTips);
    
    // המרת שעות לערכים מספריים ויצירת מערך עם נתוני העובדים
    const staff = staffMembers.map(member => ({
      ...member,
      hours: parseFloat(member.hours)
    }));
    
    // חישוב סך כל השעות
    const totalHours = staff.reduce((sum, member) => sum + member.hours, 0);
    
    // חישוב חלוקה יחסית
    let calculatedResults = staff.map(member => {
      const ratio = member.hours / totalHours;
      const exactAmount = tipsAmount * ratio;
      const roundedAmount = Math.floor(exactAmount); // עיגול כלפי מטה
      
      return {
        ...member,
        ratio,
        exactAmount,
        roundedAmount
      };
    });
    
    // חישוב הסכום הכולל המעוגל שחולק
    const totalDistributed = calculatedResults.reduce(
      (sum, result) => sum + result.roundedAmount, 
      0
    );
    
    // חישוב היתרה (מה שלא חולק בגלל העיגול)
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
  
  return (
    <TipsContainer>
      <Header>
        <Icon>
          <FaCoins />
        </Icon>
        <Title>חישוב טיפים</Title>
      </Header>
      
      <Card>
        <h2>הזן את פרטי העובדים וסכום הטיפים</h2>
        
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
          <h3>רשימת עובדים</h3>
          {staffMembers.map((staff) => (
            <StaffItem key={staff.id}>
              <div>
                <Input
                  type="text"
                  value={staff.name}
                  onChange={(e) => updateStaffMember(staff.id, 'name', e.target.value)}
                  placeholder="שם העובד"
                />
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
          </>
        )}
      </Card>
    </TipsContainer>
  );
};

export default TipsCalculator;