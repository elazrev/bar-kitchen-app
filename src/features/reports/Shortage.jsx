import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaPlus, FaTrash } from 'react-icons/fa';
import { useApp } from '../../hooks/useApp';
import { addShortage, resolveShortage, getShortages } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

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
  color: var(--accent-color);
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
  ${props => props.deleted ? 'text-decoration: line-through; color: #999;' : ''}
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

const DeletedDate = styled.span`
  font-size: 0.8rem;
  margin-right: 0.5rem;
  color: #999;
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
  const [shortages, setShortages] = useState([]);
  const { loading, setLoading } = useApp();
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    const fetchShortages = async () => {
      try {
        setLoading(true);
        const shortagesData = await getShortages();
        setShortages(shortagesData);
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת חוסרים:', err);
        setLoading(false);
      }
    };
    
    fetchShortages();
  }, [setLoading]);

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
    try {
      setLoading(true);
      
      // במקום למחוק את הפריט לגמרי, נשנה את הסטטוס שלו ל-"נמחק"
      await resolveShortage(id);
      
      // עדכון הרשימה המקומית
      const updatedShortages = shortages.map(item => 
        item.id === id 
          ? { 
              ...item, 
              recentlyDeleted: true, 
              deletedAt: new Date(),
              resolved: true
            } 
          : item
      );
      
      setShortages(updatedShortages);
      toast.success('הפריט סומן כ"טופל"');
      
      setLoading(false);
    } catch (err) {
      console.error('שגיאה בטיפול בפריט:', err);
      toast.error('אירעה שגיאה בטיפול בפריט');
      setLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (items.length === 0) return;
    
    try {
      setLoading(true);
      
      // שמירת כל הפריטים בבסיס הנתונים
      const savedItems = [];
      
      for (const item of items) {
        const savedItem = await addShortage({
          name: item.name,
          quantity: item.quantity,
          reportedAt: item.reportedAt
        });
        
        savedItems.push({
          id: savedItem.id,
          name: item.name,
          quantity: item.quantity,
          createdAt: new Date(),
          recentlyDeleted: false,
          resolved: false
        });
      }
      
      // עדכון הרשימה המקומית
      setShortages([...savedItems, ...shortages]);
      setItems([]);
      
      toast.success(`הדיווח על ${savedItems.length} פריטים חסרים נשלח בהצלחה!`);
      
      setLoading(false);
    } catch (err) {
      console.error('שגיאה בשליחת דיווח חוסרים:', err);
      toast.error('אירעה שגיאה בשליחת הדיווח');
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('he-IL', options);
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
        
        {loading ? (
          <EmptyState>טוען נתונים...</EmptyState>
        ) : shortages.length > 0 ? (
          <ShortageList>
            {shortages.map((item) => (
              <ShortageItem key={item.id}>
                <div>
                  <ItemName deleted={item.recentlyDeleted}>
                    {item.name}
                    {item.recentlyDeleted && (
                      <DeletedDate>
                        (טופל ב-{formatDate(item.deletedAt)})
                      </DeletedDate>
                    )}
                  </ItemName>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    כמות: {item.quantity}
                  </div>
                </div>
                {isAdmin() && !item.recentlyDeleted && (
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