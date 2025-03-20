import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBook, FaSearch } from 'react-icons/fa';
import { getRecipes } from '../../services/api';
import { useApp } from '../../hooks/useApp';

const RecipesContainer = styled.div`
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

const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const RecipesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.75rem;
  }
`;

const RecipeCard = styled(Link)`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  text-decoration: none;
  color: var(--text-color);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    text-decoration: none;
  }
  
  @media (max-width: 768px) {
    /* במסכים קטנים, הקטן את אפקט התנועה כדי שלא יפריע */
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const RecipeImage = styled.div`
  height: 180px;
  background-image: url(${props => props.imageUrl || '/images/default-recipe.jpg'});
  background-size: cover;
  background-position: center;
  
  @media (max-width: 768px) {
    height: 140px;
  }
  
  @media (max-width: 480px) {
    height: 120px;
  }
`;

const RecipeContent = styled.div`
  padding: 1.25rem;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const RecipeName = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 0 0 0.25rem 0;
  }
`;

const RecipeDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { setRecipes: setAppRecipes } = useApp();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipesData = await getRecipes();
        setRecipes(recipesData);
        setFilteredRecipes(recipesData);
        setAppRecipes(recipesData);
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת מתכונים:', err);
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, [setAppRecipes]);

  useEffect(() => {
    // סינון מתכונים לפי מונח החיפוש
    if (searchTerm.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = recipes.filter(
        recipe => 
          recipe.name.toLowerCase().includes(term) || 
          (recipe.description && recipe.description.toLowerCase().includes(term))
      );
      setFilteredRecipes(filtered);
    }
  }, [searchTerm, recipes]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <RecipesContainer>
      <Header>
        <Icon>
          <FaBook />
        </Icon>
        <Title>מתכונים</Title>
      </Header>
      
      <SearchContainer>
        <SearchInput>
          <Input 
            type="text" 
            placeholder="חיפוש מתכונים..." 
            value={searchTerm}
            onChange={handleSearch}
          />
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
        </SearchInput>
      </SearchContainer>
      
      {loading ? (
        <LoadingState>טוען מתכונים...</LoadingState>
      ) : filteredRecipes.length > 0 ? (
        <RecipesGrid>
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} to={`/recipes/${recipe.id}`}>
              <RecipeImage imageUrl={recipe.imageUrl} />
              <RecipeContent>
                <RecipeName>{recipe.name}</RecipeName>
                {recipe.description && (
                  <RecipeDescription>{recipe.description}</RecipeDescription>
                )}
              </RecipeContent>
            </RecipeCard>
          ))}
        </RecipesGrid>
      ) : (
        <LoadingState>
          {searchTerm ? 'לא נמצאו מתכונים התואמים את החיפוש.' : 'לא נמצאו מתכונים.'}
        </LoadingState>
      )}
    </RecipesContainer>
  );
};

export default Recipes;