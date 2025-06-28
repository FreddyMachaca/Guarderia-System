import React, { useState, useRef, useEffect } from 'react';
import './SearchableSelect.css';

const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  className = "",
  error = false,
  disabled = false,
  getOptionLabel = (option) => option.label || option.name || option.toString(),
  getOptionValue = (option) => option.value || option.id || option
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (value) {
      const option = options.find(opt => getOptionValue(opt) == value);
      setSelectedOption(option);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option =>
        getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onChange(getOptionValue(option));
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedOption(null);
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={`searchable-select ${className} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
      <div className="select-input" onClick={handleToggle}>
        <span className="select-value">
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>
        <div className="select-actions">
          {selectedOption && !disabled && (
            <button type="button" className="clear-btn" onClick={handleClear}>
              <i className="pi pi-times"></i>
            </button>
          )}
          <i className={`pi ${isOpen ? 'pi-chevron-up' : 'pi-chevron-down'} dropdown-arrow`}></i>
        </div>
      </div>

      {isOpen && (
        <div className="select-dropdown">
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="options-container">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  className={`option-item ${getOptionValue(option) == value ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {getOptionLabel(option)}
                </div>
              ))
            ) : (
              <div className="no-options">No se encontraron resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
