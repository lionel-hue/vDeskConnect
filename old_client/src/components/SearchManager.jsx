// context/SearchManager.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const SearchManager = createContext();

export const useSearch = () => {
  const context = useContext(SearchManager);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Clear search when term is empty
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  }, [searchTerm]);

  const value = {
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching
  };

  return (
    <SearchManager.Provider value={value}>
      {children}
    </SearchManager.Provider>
  );
};