import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useApp = () => {
  return useContext(AppContext);
};