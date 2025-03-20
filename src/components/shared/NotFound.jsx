import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 0 1rem;
`;

const Title = styled.h1`
  font-size: 4rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
`;

const HomeLink = styled(Link)`
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #1e3a6a;
    text-decoration: none;
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Title>404</Title>
      <Message>העמוד שחיפשת לא נמצא</Message>
      <HomeLink to="/">חזרה לדף הבית</HomeLink>
    </NotFoundContainer>
  );
};

export default NotFound;