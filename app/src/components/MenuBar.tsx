import React, { useState } from 'react';

export type InteractionType = 
  | 'rotation-bw'
  | 'piano-bw'
  | 'piano-color'
  | 'spread-bw'
  | 'spread-color'
  | 'press-grow'
  | 'anxiety';

export type MenuTheme = 'light' | 'dark';

interface MenuBarProps {
  activeTab: InteractionType;
  onTabChange: (tab: InteractionType) => void;
  theme: MenuTheme;
}

const tabs: { id: InteractionType; label: string }[] = [
  { id: 'piano-bw', label: 'Echo' },
  { id: 'piano-color', label: 'Color Echo' },
  { id: 'spread-bw', label: 'Push' },
  { id: 'spread-color', label: 'Color Push' },
  { id: 'press-grow', label: 'Gravity' },
  { id: 'anxiety', label: 'Anxiety' },
];

export const MenuBar: React.FC<MenuBarProps> = ({ activeTab, onTabChange, theme }) => {
  const isDark = theme === 'dark';
  const [hoveredTab, setHoveredTab] = useState<InteractionType | null>(null);
  
  const getTabBackgroundColor = (tabId: InteractionType) => {
    if (activeTab === tabId) {
      return isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)';
    }
    if (hoveredTab === tabId) {
      return isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)';
    }
    return 'transparent';
  };
  
  const getTabTextColor = (tabId: InteractionType) => {
    if (activeTab === tabId) {
      return isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.8)';
    }
    return isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.5)';
  };
  
  return (
    <>
      {/* Mobile Dropdown - visible only on small screens */}
      <div className="block sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as InteractionType)}
          className="px-4 py-2 rounded-[6px] appearance-none cursor-pointer outline-none"
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
            fontSize: '15px',
            fontWeight: 500,
            border: 'none',
            minWidth: '140px',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Buttons - visible only on larger screens */}
      <div className="hidden sm:flex gap-[8px] items-center p-[3px] rounded-[10px] h-[34px]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            className="flex items-center justify-center px-[8px] py-[3px] rounded-[6px] transition-all duration-200 ease-in-out"
            style={{
              backgroundColor: getTabBackgroundColor(tab.id),
              color: getTabTextColor(tab.id),
              fontSize: '13px',
              fontWeight: 500,
              lineHeight: 1.45,
              whiteSpace: 'nowrap',
              backdropFilter: activeTab === tab.id ? 'blur(10px)' : undefined,
              WebkitBackdropFilter: activeTab === tab.id ? 'blur(10px)' : undefined,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
};

