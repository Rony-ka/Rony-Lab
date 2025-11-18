import { useState } from 'react';
import { MenuBar, InteractionType, MenuTheme } from './components/MenuBar';
import { SpacingSlider } from './components/SpacingSlider';
import { LinesRotationBW } from './components/interactions/LinesRotationBW';
import { LinesPianoBW } from './components/interactions/LinesPianoBW';
import { LinesPianoColor } from './components/interactions/LinesPianoColor';
import { LinesSpreadBW } from './components/interactions/LinesSpreadBW';
import { LinesSpreadColor } from './components/interactions/LinesSpreadColor';
import { LinesPressGrow } from './components/interactions/LinesPressGrow';

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
        return <LinesPressGrow gridColWidth={gridColWidth} />;
      default:
        return <LinesRotationBW gridColWidth={gridColWidth} />;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      <MenuBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        theme={getTheme(activeTab)}
      />
      <div className="w-full h-full">
        {renderInteraction()}
      </div>
      <SpacingSlider
        value={gridColWidth}
        onChange={setGridColWidth}
        theme={getTheme(activeTab)}
        min={10}
        max={70}
        defaultValue={ORIGINAL_SPACING}
      />
    </div>
  );
}

export default App;

