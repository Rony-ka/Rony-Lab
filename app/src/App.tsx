import { useState } from 'react';
import { MenuBar, InteractionType, MenuTheme } from './components/MenuBar';
import { SpacingSlider } from './components/SpacingSlider';
import { LinesRotationBW } from './components/interactions/LinesRotationBW';
import { LinesPianoBW } from './components/interactions/LinesPianoBW';
import { LinesPianoColor } from './components/interactions/LinesPianoColor';
import { LinesSpreadBW } from './components/interactions/LinesSpreadBW';
import { LinesSpreadColor } from './components/interactions/LinesSpreadColor';
import { LinesPressGrow } from './components/interactions/LinesPressGrow';
import { CursorAnxiety } from './components/interactions/CursorAnxiety';

const ORIGINAL_SPACING = 20;

function App() {
  const [activeTab, setActiveTab] = useState<InteractionType>('piano-bw');
  const [gridColWidth, setGridColWidth] = useState<number>(ORIGINAL_SPACING);

  // Determine theme based on active tab's background
  const getTheme = (tab: InteractionType): MenuTheme => {
    // Black background pages use dark theme
    if (tab === 'piano-color' || tab === 'spread-color') {
      return 'dark';
    }
    // White background pages use light theme
    return 'light';
  };

  const renderInteraction = () => {
    switch (activeTab) {
      case 'rotation-bw':
        return <LinesRotationBW gridColWidth={gridColWidth} />;
      case 'piano-bw':
        return <LinesPianoBW gridColWidth={gridColWidth} />;
      case 'piano-color':
        return <LinesPianoColor gridColWidth={gridColWidth} />;
      case 'spread-bw':
        return <LinesSpreadBW gridColWidth={gridColWidth} />;
      case 'spread-color':
        return <LinesSpreadColor gridColWidth={gridColWidth} />;
      case 'press-grow':
        return <LinesPressGrow 
          gridColWidth={gridColWidth} 
          pressedInteractionRadius={600}
        />;
      case 'anxiety':
        return <CursorAnxiety 
          gridColWidth={gridColWidth * 2.5} 
          gridRowHeight={gridColWidth * 2.5} 
          cursorSize={27}
          interactionRadius={10000}
          movementRadius={350} 
          cursorImageUrl="data:image/svg+xml,%3Csvg width='18' height='24' viewBox='0 0 18 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='shadow' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeDropShadow dx='0' dy='1' stdDeviation='0.5' flood-opacity='0.3'/%3E%3C/filter%3E%3C/defs%3E%3Cg filter='url(%23shadow)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6.07381 17.1676C5.21586 17.8032 4 17.1907 4 16.123V4.20711C4 3.76166 4.53857 3.53857 4.85355 3.85355L13.5014 12.5014C14.2867 13.2867 13.7892 14.6316 12.6818 14.7168L9 15L6.07381 17.1676Z' fill='white'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.3902 17.5912C12.8242 18.5919 12.3604 19.7546 11.3568 20.1819C10.3675 20.6032 9.22325 20.1514 8.78865 19.1678L5.61699 11.9899C5.1667 10.9709 5.63934 9.7806 6.66605 9.34803C7.67284 8.92384 8.83346 9.38934 9.26811 10.3917L12.3902 17.5912Z' fill='white'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M11.4226 17.7908C11.6535 18.3033 11.4165 18.9054 10.8982 19.123C10.3985 19.3328 9.82258 19.106 9.60006 18.6118L7.22721 13.3418C6.99683 12.8302 7.23314 12.2292 7.75031 12.0115C8.24967 11.8013 8.82557 12.0276 9.04816 12.5216L11.4226 17.7908Z' fill='black'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.34158 5.74943C5.21565 5.62322 5 5.71241 5 5.8907V15.8006C5 16.1292 5.37428 16.3176 5.63824 16.1219L8.5 14L12.3121 13.665C12.6503 13.6353 12.8001 13.2244 12.5603 12.984L5.34158 5.74943Z' fill='black'/%3E%3C/g%3E%3C/svg%3E" 
        />;
      default:
        return <LinesRotationBW gridColWidth={gridColWidth} />;
    }
  };

  const isDark = getTheme(activeTab) === 'dark';

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Centered container for MenuBar and SpacingSlider */}
      <div 
        className="w-full flex items-center justify-center px-2 sm:px-0"
        style={{ 
          position: 'absolute',
          top: '16px',
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <div 
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 sm:gap-[8px] px-3 py-3 sm:px-[3px] sm:py-[2px] rounded-[9px] w-[90vw] sm:w-auto max-w-full"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(175,175,175,0.04)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <MenuBar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            theme={getTheme(activeTab)}
          />
          <SpacingSlider
            value={gridColWidth}
            onChange={setGridColWidth}
            theme={getTheme(activeTab)}
            min={10}
            max={70}
            defaultValue={ORIGINAL_SPACING}
          />
        </div>
      </div>
      
      <div className="w-full h-full">
        {renderInteraction()}
      </div>
    </div>
  );
}

export default App;

