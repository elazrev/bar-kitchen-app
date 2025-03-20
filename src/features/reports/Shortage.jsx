import { useState } from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaPlus, FaTrash } from 'react-icons/fa';
import { useApp } from '../../hooks/useApp';
import { addShortage } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const ShortageContainer = styled.div`
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
  color: var(--accent-color  );
};

export default Shortage;
`;

const Card = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  border-bottom: 1px solid var(--light-gray);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
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

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AddButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.75rem 1rem;
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
`;

const ShortageItemsList = styled.div`
  margin-top: 2rem;
`;

const ShortageItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: var(--border-radius);
  margin-bottom: 0.75rem;
`;

const ItemName = styled.div`
  font-weight: 500;
`;

const ItemQuantity = styled.div`
  color: #666;
  margin-right: 1rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  font-size: 1.1rem;
  
  &:hover {
    color: #d32f2f;
  }
`;

const SubmitButton = styled.button`
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
    background-color: #e66a3e;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ShortageList = styled.div`
  margin-top: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 1.5rem;
  color: #666;
`;

const Shortage = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [items, setItems] = useState([]);
  const { sendShortageReport, shortages, removeShortage, loading } = useApp();
  const { isAdmin } = useAuth();

  const handleAddItem = () => {
    if (!name.trim()) return;
    
    const newItem = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: quantity.trim() || 'לא צוין',
      reportedAt: new Date().toISOString()
    };
    
    setItems([...items, newItem]);
    setName('');
    setQuantity('');
  };
  
  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const handleRemoveReportedItem = async (id) => {
    await removeShortage(id);
  };
  
  const handleSubmit = async () => {
    if (items.length === 0) return;
    
    // קריאה לשרת דרך הקונטקסט
    await sendShortageReport(items);
    setItems([]);
  };
  
  return (
    <ShortageContainer>
      <Header>
        <Icon>
          <FaExclamationTriangle />
        </Icon>
        <Title>דיווח על חוסרים</Title>
      </Header>
      
      <Card>
        <CardHeader>
          <CardTitle>הוספת פריטים חסרים</CardTitle>
        </CardHeader>
        
        <FormRow>
          <FormGroup style={{ flex: 2 }}>
            <Label htmlFor="itemName">שם הפריט</Label>
            <Input
              id="itemName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: לימונים"
            />
          </FormGroup>
          
          <FormGroup style={{ flex: 1 }}>
            <Label htmlFor="itemQuantity">כמות</Label>
            <Input
              id="itemQuantity"
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="לדוגמה: 2 ק״ג"
            />
          </FormGroup>
          
          <FormGroup style={{ display: 'flex', alignItems: 'flex-end' }}>
            <AddButton onClick={handleAddItem} type="button">
              <FaPlus />
              הוסף
            </AddButton>
          </FormGroup>
        </FormRow>
        
        {items.length > 0 && (
          <ShortageItemsList>
            {items.map((item) => (
              <ShortageItem key={item.id}>
                <ItemName>{item.name}</ItemName>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ItemQuantity>{item.quantity}</ItemQuantity>
                  <DeleteButton onClick={() => handleRemoveItem(item.id)}>
                    <FaTrash />
                  </DeleteButton>
                </div>
              </ShortageItem>
            ))}
            
            <SubmitButton 
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
            >
              שלח דיווח על {items.length} פריטים חסרים
            </SubmitButton>
          </ShortageItemsList>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>פריטים חסרים שדווחו</CardTitle>
        </CardHeader>
        
        {shortages.length > 0 ? (
          <ShortageList>
            {shortages.map((item) => (
              <ShortageItem key={item.id}>
                <div>
                  <ItemName>{item.name}</ItemName>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    כמות: {item.quantity}
                  </div>
                </div>
                {isAdmin() && (
                  <DeleteButton onClick={() => handleRemoveReportedItem(item.id)}>
                    <FaTrash />
                  </DeleteButton>
                )}
              </ShortageItem>
            ))}
          </ShortageList>
        ) : (
          <EmptyState>אין כרגע פריטים חסרים שדווחו.</EmptyState>
        )}
      </Card>
    </ShortageContainer>
  );
};
  
  export default Shortage;