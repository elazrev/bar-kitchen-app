import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaBook, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaImage
} from 'react-icons/fa';
import { 
  getRecipes, 
  addRecipe, 
  updateRecipe, 
  deleteRecipe 
} from '../../services/api';
import { getResizedImageUrl } from '../../services/cloudinary';
import { toast } from 'react-toastify';

const RecipesContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
`;

const RecipesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const RecipesTitle = styled.h2`
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
`;

const RecipesList = styled.div`
  margin-top: 1rem;
`;

const RecipeCard = styled.div`
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: ${props => props.editing ? '#f9f9f9' : 'white'};
`;
const RecipeContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const RecipeInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
`;

const RecipeImageThumb = styled.div`
  width: 60px;
  height: 60px;
  background-image: url(${props => props.imageUrl || '/images/default-recipe.jpg'});
  background-size: cover;
  background-position: center;
  border-radius: var(--border-radius);
  margin-left: 1rem;
`;

const RecipeDetails = styled.div`
  flex: 1;
`;

const RecipeActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.delete ? 'var(--error-color)' : 'var(--primary-color)'};
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  
  &:hover {
    color: ${props => props.delete ? '#d32f2f' : '#1e3a6a'};
  }
`;

const RecipeForm = styled.div`
  margin-top: ${props => props.editing ? '1rem' : '0'};
  border-top: ${props => props.editing ? '1px solid var(--light-gray)' : 'none'};
  padding-top: ${props => props.editing ? '1rem' : '0'};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 200px;
  background-image: url(${props => props.imageUrl || '/images/default-recipe.jpg'});
  background-size: cover;
  background-position: center;
  border-radius: var(--border-radius);
  margin-bottom: 0.5rem;
`;

const FileUploadLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--light-gray);
  color: var(--text-color);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: #e1e1e1;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const Small = styled.small`
  display: block;
  color: #777;
  margin-top: 0.5rem;
`;

const IngredientsList = styled.div`
  margin-top: 1rem;
`;

const IngredientItem = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  > div:first-child {
    flex: 1;
  }
  
  > div:last-child {
    flex: 2;
  }
`;

const AddIngredientButton = styled.button`
  background: none;
  border: 1px dashed var(--light-gray);
  color: var(--primary-color);
  padding: 0.5rem;
  border-radius: var(--border-radius);
  width: 100%;
  cursor: pointer;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const InstructionsList = styled.div`
  margin-top: 1rem;
`;

const InstructionItem = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  > div {
    flex: 1;
  }
`;

const AddInstructionButton = styled.button`
  background: none;
  border: 1px dashed var(--light-gray);
  color: var(--primary-color);
  padding: 0.5rem;
  border-radius: var(--border-radius);
  width: 100%;
  cursor: pointer;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const SaveButton = styled.button`
  background-color: var(--success-color);
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
    background-color: #3d8b40;
  }
`;

const CancelButton = styled.button`
  background-color: #f44336;
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
    background-color: #d32f2f;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #d32f2f;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;
const AdminRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [newRecipe, setNewRecipe] = useState({
      name: '',
      description: '',
      prepTime: '',
      servings: '',
      ingredients: [{ amount: '', name: '' }],
      instructions: [''],
      notes: '',
      imageFile: null,
      imageUrl: ''
    });
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
  
    useEffect(() => {
      const fetchRecipes = async () => {
        try {
          const recipesData = await getRecipes();
          setRecipes(recipesData);
          setLoading(false);
        } catch (err) {
          console.error('שגיאה בטעינת מתכונים:', err);
          toast.error('אירעה שגיאה בטעינת המתכונים');
          setLoading(false);
        }
      };
      
      fetchRecipes();
    }, []);
  
    const handleAddRecipe = () => {
      setIsAddingNew(true);
      setNewRecipe({
        name: '',
        description: '',
        prepTime: '',
        servings: '',
        ingredients: [{ amount: '', name: '' }],
        instructions: [''],
        notes: '',
        imageFile: null,
        imageUrl: ''
      });
      setPreviewUrl('');
    };
    
    const handleEditRecipe = (recipe) => {
      setEditingRecipe({ 
        ...recipe,
        ingredients: recipe.ingredients || [{ amount: '', name: '' }],
        instructions: recipe.instructions || [''],
        imageFile: null
      });
      setPreviewUrl(recipe.imageUrl || '');
    };
    const handleDeleteRecipe = async (recipeId) => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק מתכון זה?')) {
          return;
        }
        
        try {
          setLoading(true);
          await deleteRecipe(recipeId);
          setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
          toast.success('המתכון נמחק בהצלחה');
          setLoading(false);
        } catch (err) {
          console.error('שגיאה במחיקת מתכון:', err);
          toast.error('אירעה שגיאה במחיקת המתכון');
          setLoading(false);
        }
      };
      
      const handleImageChange = (e, isEditing) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // וידוא שהקובץ הוא תמונה
        if (!file.type.match('image.*')) {
          toast.error('יש לבחור קובץ תמונה בלבד');
          return;
        }
        
        // וידוא שגודל הקובץ סביר (למשל, פחות מ-5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('גודל התמונה חייב להיות פחות מ-5MB');
          return;
        }
        
        // יצירת URL מקומי לתצוגה מקדימה
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        
        if (isEditing) {
          setEditingRecipe({
            ...editingRecipe,
            imageFile: file
          });
        } else {
          setNewRecipe({
            ...newRecipe,
            imageFile: file
          });
        }
      };
      
      const handleAddIngredient = (isEditing) => {
        if (isEditing) {
          setEditingRecipe({
            ...editingRecipe,
            ingredients: [...editingRecipe.ingredients, { amount: '', name: '' }]
          });
        } else {
          setNewRecipe({
            ...newRecipe,
            ingredients: [...newRecipe.ingredients, { amount: '', name: '' }]
          });
        }
      };
      
      const handleRemoveIngredient = (index, isEditing) => {
        if (isEditing) {
          const ingredients = [...editingRecipe.ingredients];
          ingredients.splice(index, 1);
          setEditingRecipe({
            ...editingRecipe,
            ingredients
          });
        } else {
          const ingredients = [...newRecipe.ingredients];
          ingredients.splice(index, 1);
          setNewRecipe({
            ...newRecipe,
            ingredients
          });
        }
      };
      const handleIngredientChange = (index, field, value, isEditing) => {
        if (isEditing) {
          const ingredients = [...editingRecipe.ingredients];
          ingredients[index][field] = value;
          setEditingRecipe({
            ...editingRecipe,
            ingredients
          });
        } else {
          const ingredients = [...newRecipe.ingredients];
          ingredients[index][field] = value;
          setNewRecipe({
            ...newRecipe,
            ingredients
          });
        }
      };
      
      const handleAddInstruction = (isEditing) => {
        if (isEditing) {
          setEditingRecipe({
            ...editingRecipe,
            instructions: [...editingRecipe.instructions, '']
          });
        } else {
          setNewRecipe({
            ...newRecipe,
            instructions: [...newRecipe.instructions, '']
          });
        }
      };
      
      const handleRemoveInstruction = (index, isEditing) => {
        if (isEditing) {
          const instructions = [...editingRecipe.instructions];
          instructions.splice(index, 1);
          setEditingRecipe({
            ...editingRecipe,
            instructions
          });
        } else {
          const instructions = [...newRecipe.instructions];
          instructions.splice(index, 1);
          setNewRecipe({
            ...newRecipe,
            instructions
          });
        }
      };
      
      const handleInstructionChange = (index, value, isEditing) => {
        if (isEditing) {
          const instructions = [...editingRecipe.instructions];
          instructions[index] = value;
          setEditingRecipe({
            ...editingRecipe,
            instructions
          });
        } else {
          const instructions = [...newRecipe.instructions];
          instructions[index] = value;
          setNewRecipe({
            ...newRecipe,
            instructions
          });
        }
      };

      const handleSaveRecipe = async () => {
        if (!editingRecipe.name.trim()) {
          toast.error('שם המתכון הוא שדה חובה');
          return;
        }
        
        // וידוא שיש לפחות מרכיב אחד עם שם
        if (!editingRecipe.ingredients.some(i => i.name.trim())) {
          toast.error('יש להוסיף לפחות מרכיב אחד');
          return;
        }
        
        // וידוא שיש לפחות הוראה אחת
        if (!editingRecipe.instructions.some(i => i.trim())) {
          toast.error('יש להוסיף לפחות הוראת הכנה אחת');
          return;
        }
        
        try {
          setLoading(true);
          
          await updateRecipe(
            editingRecipe.id, 
            {
              name: editingRecipe.name,
              description: editingRecipe.description,
              prepTime: editingRecipe.prepTime,
              servings: editingRecipe.servings,
              ingredients: editingRecipe.ingredients.filter(i => i.name.trim()),
              instructions: editingRecipe.instructions.filter(i => i.trim()),
              notes: editingRecipe.notes
            },
            editingRecipe.imageFile
          );
          
          // קבל מחדש את כל המתכונים כדי לקבל את ה-URL העדכני של התמונה מ-Cloudinary
          const updatedRecipes = await getRecipes();
          setRecipes(updatedRecipes);
          
          setEditingRecipe(null);
          setPreviewUrl('');
          toast.success('המתכון עודכן בהצלחה');
          setLoading(false);
        } catch (err) {
          console.error('שגיאה בעדכון המתכון:', err);
          toast.error('אירעה שגיאה בעדכון המתכון');
          setLoading(false);
        }
      };
      
      const handleSaveNewRecipe = async () => {
        if (!newRecipe.name.trim()) {
          toast.error('שם המתכון הוא שדה חובה');
          return;
        }
        
        // וידוא שיש לפחות מרכיב אחד עם שם
        if (!newRecipe.ingredients.some(i => i.name.trim())) {
          toast.error('יש להוסיף לפחות מרכיב אחד');
          return;
        }
        
        // וידוא שיש לפחות הוראה אחת
        if (!newRecipe.instructions.some(i => i.trim())) {
          toast.error('יש להוסיף לפחות הוראת הכנה אחת');
          return;
        }
        
        try {
          setLoading(true);
          
          await addRecipe(
            {
              name: newRecipe.name,
              description: newRecipe.description,
              prepTime: newRecipe.prepTime,
              servings: newRecipe.servings,
              ingredients: newRecipe.ingredients.filter(i => i.name.trim()),
              instructions: newRecipe.instructions.filter(i => i.trim()),
              notes: newRecipe.notes
            },
            newRecipe.imageFile
          );
          
          // קבל מחדש את כל המתכונים כדי לקבל את ה-URL העדכני של התמונה מ-Cloudinary
          const updatedRecipes = await getRecipes();
          setRecipes(updatedRecipes);
          
          setIsAddingNew(false);
          setPreviewUrl('');
          toast.success('המתכון נוסף בהצלחה');
          setLoading(false);
        } catch (err) {
          console.error('שגיאה בהוספת מתכון חדש:', err);
          toast.error('אירעה שגיאה בהוספת המתכון');
          setLoading(false);
        }
      };
      
      const handleCancelEdit = () => {
        setEditingRecipe(null);
        setPreviewUrl('');
      };
      
      const handleCancelAdd = () => {
        setIsAddingNew(false);
        setPreviewUrl('');
      };

      if (loading && recipes.length === 0) {
        return <LoadingState>טוען מתכונים...</LoadingState>;
      }
    
      return (
        <RecipesContainer>
          <RecipesHeader>
            <RecipesTitle>
              <FaBook />
              ניהול מתכונים
            </RecipesTitle>
            <AddButton onClick={handleAddRecipe}>
              <FaPlus />
              הוסף מתכון חדש
            </AddButton>
          </RecipesHeader>
          
          <RecipesList>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} editing={editingRecipe?.id === recipe.id}>
                <RecipeContent>
                  <RecipeInfo>
                    <RecipeImageThumb imageUrl={recipe.imageUrl} />
                    <RecipeDetails>
                      <h3>{recipe.name}</h3>
                      {recipe.description && <p>{recipe.description}</p>}
                    </RecipeDetails>
                  </RecipeInfo>
                  <RecipeActions>
                    <ActionButton onClick={() => handleEditRecipe(recipe)}>
                      <FaEdit />
                    </ActionButton>
                    <ActionButton delete onClick={() => handleDeleteRecipe(recipe.id)}>
                      <FaTrash />
                    </ActionButton>
                  </RecipeActions>
                </RecipeContent>

                {editingRecipe?.id === recipe.id && (
              <RecipeForm editing>
                <FormGrid>
                  <FormGroup>
                    <Label>שם המתכון</Label>
                    <Input
                      type="text"
                      value={editingRecipe.name}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, name: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>תיאור קצר</Label>
                    <Input
                      type="text"
                      value={editingRecipe.description || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, description: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>זמן הכנה (דקות)</Label>
                    <Input
                      type="number"
                      value={editingRecipe.prepTime || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, prepTime: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>מספר מנות</Label>
                    <Input
                      type="number"
                      value={editingRecipe.servings || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, servings: e.target.value })}
                    />
                  </FormGroup>
                </FormGrid>
                
                <FormGroup>
                  <Label>תמונה</Label>
                  <ImageUploadContainer>
                    <ImagePreview imageUrl={previewUrl || editingRecipe.imageUrl} />
                    <FileUploadLabel>
                      <FaImage />
                      בחר תמונה
                      <FileInput 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, true)}
                      />
                    </FileUploadLabel>
                    <Small>התמונה תועלה לשרת Cloudinary. גודל מקסימלי: 5MB.</Small>
                  </ImageUploadContainer>
                </FormGroup>

                <FormGroup>
                  <Label>מרכיבים</Label>
                  <IngredientsList>
                    {editingRecipe.ingredients.map((ingredient, index) => (
                      <IngredientItem key={index}>
                        <div>
                          <Input
                            type="text"
                            placeholder="כמות"
                            value={ingredient.amount}
                            onChange={(e) => handleIngredientChange(index, 'amount', e.target.value, true)}
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            placeholder="שם המרכיב"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value, true)}
                          />
                        </div>
                        <RemoveButton 
                          onClick={() => handleRemoveIngredient(index, true)}
                          disabled={editingRecipe.ingredients.length === 1}
                        >
                          <FaTimes />
                        </RemoveButton>
                      </IngredientItem>
                    ))}
                    <AddIngredientButton onClick={() => handleAddIngredient(true)}>
                      הוסף מרכיב
                    </AddIngredientButton>
                  </IngredientsList>
                </FormGroup>
                
                <FormGroup>
                  <Label>הוראות הכנה</Label>
                  <InstructionsList>
                    {editingRecipe.instructions.map((instruction, index) => (
                      <InstructionItem key={index}>
                        <div>
                          <Textarea
                            placeholder={`צעד ${index + 1}`}
                            value={instruction}
                            onChange={(e) => handleInstructionChange(index, e.target.value, true)}
                          />
                        </div>
                        <RemoveButton 
                          onClick={() => handleRemoveInstruction(index, true)}
                          disabled={editingRecipe.instructions.length === 1}
                        >
                          <FaTimes />
                        </RemoveButton>
                      </InstructionItem>
                    ))}
                    <AddInstructionButton onClick={() => handleAddInstruction(true)}>
                      הוסף צעד
                    </AddInstructionButton>
                  </InstructionsList>
                </FormGroup>

                <FormGroup>
                  <Label>הערות נוספות</Label>
                  <Textarea
                    value={editingRecipe.notes || ''}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, notes: e.target.value })}
                  />
                </FormGroup>
                
                <FormActions>
                  <CancelButton onClick={handleCancelEdit}>
                    <FaTimes />
                    ביטול
                  </CancelButton>
                  <SaveButton onClick={handleSaveRecipe} disabled={loading}>
                    <FaSave />
                    {loading ? 'שומר...' : 'שמור'}
                  </SaveButton>
                </FormActions>
              </RecipeForm>
            )}
          </RecipeCard>
        ))}
        
        {isAddingNew && (
          <RecipeCard editing>
            <h3>מתכון חדש</h3>
            <RecipeForm editing>
              <FormGrid>
                <FormGroup>
                  <Label>שם המתכון</Label>
                  <Input
                    type="text"
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>תיאור קצר</Label>
                  <Input
                    type="text"
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>זמן הכנה (דקות)</Label>
                  <Input
                    type="number"
                    value={newRecipe.prepTime}
                    onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>מספר מנות</Label>
                  <Input
                    type="number"
                    value={newRecipe.servings}
                    onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })}
                  />
                </FormGroup>
              </FormGrid>

              <FormGroup>
                <Label>מרכיבים</Label>
                <IngredientsList>
                  {newRecipe.ingredients.map((ingredient, index) => (
                    <IngredientItem key={index}>
                      <div>
                        <Input
                          type="text"
                          placeholder="כמות"
                          value={ingredient.amount}
                          onChange={(e) => handleIngredientChange(index, 'amount', e.target.value, false)}
                        />
                      </div>
                      <div>
                        <Input
                          type="text"
                          placeholder="שם המרכיב"
                          value={ingredient.name}
                          onChange={(e) => handleIngredientChange(index, 'name', e.target.value, false)}
                        />
                      </div>
                      <RemoveButton 
                        onClick={() => handleRemoveIngredient(index, false)}
                        disabled={newRecipe.ingredients.length === 1}
                      >
                        <FaTimes />
                      </RemoveButton>
                    </IngredientItem>
                  ))}
                  <AddIngredientButton onClick={() => handleAddIngredient(false)}>
                    הוסף מרכיב
                  </AddIngredientButton>
                </IngredientsList>
              </FormGroup>

              <FormGroup>
                <Label>הוראות הכנה</Label>
                <InstructionsList>
                  {newRecipe.instructions.map((instruction, index) => (
                    <InstructionItem key={index}>
                      <div>
                        <Textarea
                          placeholder={`צעד ${index + 1}`}
                          value={instruction}
                          onChange={(e) => handleInstructionChange(index, e.target.value, false)}
                        />
                      </div>
                      <RemoveButton 
                        onClick={() => handleRemoveInstruction(index, false)}
                        disabled={newRecipe.instructions.length === 1}
                      >
                        <FaTimes />
                      </RemoveButton>
                    </InstructionItem>
                  ))}
                  <AddInstructionButton onClick={() => handleAddInstruction(false)}>
                    הוסף צעד
                  </AddInstructionButton>
                </InstructionsList>
              </FormGroup>
              
              <FormGroup>
                <Label>הערות נוספות</Label>
                <Textarea
                  value={newRecipe.notes}
                  onChange={(e) => setNewRecipe({ ...newRecipe, notes: e.target.value })}
                />
              </FormGroup>
              
              <FormActions>
                <CancelButton onClick={handleCancelAdd}>
                  <FaTimes />
                  ביטול
                </CancelButton>
                <SaveButton onClick={handleSaveNewRecipe} disabled={loading}>
                  <FaSave />
                  {loading ? 'שומר...' : 'שמור'}
                </SaveButton>
              </FormActions>
            </RecipeForm>
          </RecipeCard>
        )}
        
        {recipes.length === 0 && !isAddingNew && (
          <LoadingState>
            אין כרגע מתכונים. לחץ על "הוסף מתכון חדש" כדי להתחיל.
          </LoadingState>
        )}
      </RecipesList>
    </RecipesContainer>
  );
};

export default AdminRecipes;

