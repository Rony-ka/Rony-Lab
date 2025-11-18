import React, { useState } from 'react';

export type InteractionType = 
  | 'rotation-bw'
  | 'piano-bw'
  | 'piano-color'
  | 'spread-bw'
  | 'spread-color'
  | 'press-grow';

export type MenuTheme = 'light' | 'dark';

interface MenuBarProps {
  activeTab: InteractionType;
  onTabChange: (tab: InteractionType) => void;
  theme: MenuTheme;
}

const tabs: { id: InteractionType; label: string }[] = [
  { id: 'piano-bw', label: 'Echo' },
  { id: 'piano-color', label: 'Color Echo' },
  { id: 'spread-bw', label: 'Radiate' },
  { id: 'spread-color', label: 'Color Radiate' },
  { id: 'press-grow', label: 'Gravity' },
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
    <div 
      className="w-full flex items-center justify-center"
      style={{ 
        position: 'absolute',
        top: '16px',
        left: 0,
        right: 0,
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      <div 
        className="flex flex-col gap-[10px] px-[3px] py-[2px] rounded-[9px] overflow-hidden"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(175,175,175,0.04)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          pointerEvents: 'auto'
        }}
      >
        <div className="flex gap-[8px] h-[34px] items-center p-[3px] rounded-[10px]">
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
      </div>
    </div>
  );
};

