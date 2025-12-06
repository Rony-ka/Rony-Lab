import React, { useState, useRef, useEffect } from 'react';
import { InteractionType, MenuTheme } from './MenuBar';

interface CustomDropdownProps {
  value: InteractionType;
  onChange: (value: InteractionType) => void;
  options: { id: InteractionType; label: string }[];
  theme: MenuTheme;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionId: InteractionType) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div 
      ref={dropdownRef} 
      className="relative w-full mb-4"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-[16px] cursor-pointer outline-none text-left flex items-center justify-between"
        style={{
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
          fontSize: '15px',
          fontWeight: 500,
          border: 'none',
        }}
      >
        <span>{selectedOption?.label}</span>
        <svg 
          width="12" 
          height="7" 
          viewBox="0 0 12 7" 
          fill="none" 
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <path 
            d="M1 1L6 6L11 1" 
            stroke={isDark ? '#fff' : '#000'} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-[16px] overflow-hidden shadow-lg z-50"
          style={{
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className="w-full px-4 py-3 text-left transition-colors"
              style={{
                backgroundColor: value === option.id 
                  ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')
                  : 'transparent',
                color: value === option.id
                  ? (isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)')
                  : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                fontSize: '15px',
                fontWeight: value === option.id ? 600 : 500,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

