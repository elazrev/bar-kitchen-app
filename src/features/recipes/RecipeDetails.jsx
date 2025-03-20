import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowRight, FaUtensils, FaList, FaClock } from 'react-icons/fa';
import { getRecipeById } from '../../services/api';

const RecipeContainer = styled.div`
  padding: 2rem 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 1rem;
  padding: 0;
  margin-bottom: 1.5rem;
  cursor: pointer;
  
  svg {
    margin-left: 0.5rem;
  }
`;

const RecipeCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
`;

const RecipeHeader = styled.div`
  position: relative;
  height: 300px;
`;

const RecipeImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.imageUrl || '/images/default-recipe.jpg'});
  background-size: cover;
  background-position: center;
`;

const RecipeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 2rem;
  color: white;
`;

const RecipeName = styled.h1`
  font-size: 2rem;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const RecipeDescription = styled.p`
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
`;

const RecipeContent = styled.div`
  padding: 2rem;
`;

const RecipeMeta = styled.div`
  display: flex;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  margin-left: 2rem;
  margin-bottom: 0.5rem;
  
  svg {
    margin-left: 0.5rem;
    color: var(--primary-color);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-left: 0.5rem;
    color: var(--primary-color);
  }
`;

const IngredientsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

const IngredientItem = styled.li`
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--light-gray);
  
  &:last-child {
    border-bottom: none;
  }
`;

const IngredientAmount = styled.span`
  font-weight: 500;
  min-width: 100px;
`;

const IngredientName = styled.span`
  flex: 1;
`;

const InstructionsList = styled.ol`
  padding-right: 1.25rem;
  margin: 0 0 2rem 0;
`;

const InstructionItem = styled.li`
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const RecipeDetails = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeData = await getRecipeById(id);
        setRecipe(recipeData);
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת המתכון:', err);
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id]);

  const goBack = () => {
    navigate('/recipes');
  };

  if (loading) {
    return <LoadingState>טוען מתכון...</LoadingState>;
  }

  if (!recipe) {
    return <LoadingState>המתכון לא נמצא.</LoadingState>;
  }

  return (
    <RecipeContainer>
      <BackButton onClick={goBack}>
        <FaArrowRight />
        חזרה למתכונים
      </BackButton>
      
      <RecipeCard>
        <RecipeHeader>
          <RecipeImage imageUrl={recipe.imageUrl} />
          <RecipeOverlay>
            <RecipeName>{recipe.name}</RecipeName>
            {recipe.description && (
              <RecipeDescription>{recipe.description}</RecipeDescription>
            )}
          </RecipeOverlay>
        </RecipeHeader>
        
        <RecipeContent>
          <RecipeMeta>
            {recipe.prepTime && (
              <MetaItem>
                <FaClock />
                זמן הכנה: {recipe.prepTime} דקות
              </MetaItem>
            )}
            {recipe.servings && (
              <MetaItem>
                <FaUtensils />
                מנות: {recipe.servings}
              </MetaItem>
            )}
          </RecipeMeta>
          
          <SectionTitle>
            <FaList />
            מרכיבים
          </SectionTitle>
          <IngredientsList>
            {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
              <IngredientItem key={index}>
                <IngredientAmount>{ingredient.amount}</IngredientAmount>
                <IngredientName>{ingredient.name}</IngredientName>
              </IngredientItem>
            ))}
          </IngredientsList>
          
          <SectionTitle>
            <FaUtensils />
            אופן ההכנה
          </SectionTitle>
          <InstructionsList>
            {recipe.instructions && recipe.instructions.map((instruction, index) => (
              <InstructionItem key={index}>{instruction}</InstructionItem>
            ))}
          </InstructionsList>
          
          {recipe.notes && (
            <>
              <SectionTitle>הערות</SectionTitle>
              <p>{recipe.notes}</p>
            </>
          )}
        </RecipeContent>
      </RecipeCard>
    </RecipeContainer>
  );
};

export default RecipeDetails;