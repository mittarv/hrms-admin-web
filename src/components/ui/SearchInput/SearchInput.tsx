import React from 'react';
import { Search } from 'lucide-react';
import styles from './SearchInput.module.scss';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = ({ className, ...props }) => {
  return (
    <div className={styles.searchContainer}>
      <Search className={styles.searchIcon} />
      <input 
        type="text" 
        className={`${styles.inputSearch} ${className || ''}`}
        {...props} 
      />
    </div>
  );
};
