# Implementation Guide

## Overview

This platform successfully converts 7 HTML interactive line visualizations into a unified React application with a Cursor-inspired menu bar. All components are fully parameterized and ready for future control panel integration.

## Architecture

### Component Structure

```
App (State Management)
├── MenuBar (Navigation)
└── Interaction Components (7 total)
    ├── LinesMagnet
    ├── LinesPianoBW
    ├── LinesPianoColor
    ├── LinesRotationBW
    ├── LinesRotationColor
    ├── LinesSpreadBW
    └── LinesSpreadColor
```

### Key Design Decisions

1. **Full Parameterization**: Every hardcoded value from the original HTML files has been extracted into component props with TypeScript interfaces.

2. **React Hooks Pattern**: All components use `useEffect` and `useRef` for DOM manipulation while maintaining React lifecycle compatibility.

3. **Performance**: Original `requestAnimationFrame` patterns preserved for smooth 60fps animations.

4. **Cleanup**: All event listeners and animation frames properly cleaned up on component unmount.

5. **TypeScript Safety**: Full type definitions for all props and internal state.

## Component Parameters

### Example: LinesMagnet

```typescript
interface LinesMagnetConfig {
  gridRowHeight?: number;          // Default: 45
  gridColWidth?: number;           // Default: 20
  interactionRadius?: number;      // Default: 2000
  lerpFactor?: number;             // Default: 0.02
  pressedLerpFactor?: number;      // Default: 0.04
  pressedEffectMultiplier?: number; // Default: 0
  baseEffectStrength?: number;     // Default: 0.8
  lineColor?: string;              // Default: '#000000'
  lineWidth?: number;              // Default: 1.5
  lineHeight?: number;             // Default: 46
  backgroundColor?: string;        // Default: '#ffffff'
}
```

### Usage Example

```tsx
// Using default values
<LinesMagnet />

// With custom parameters
<LinesMagnet 
  gridRowHeight={50}
  interactionRadius={1000}
  lineColor="#FF0000"
  backgroundColor="#000000"
/>
```

## Adding Parameter Controls

### Step 1: Create Control Panel Component

```tsx
// src/components/ControlPanel.tsx
import { useState } from 'react';

interface ControlPanelProps {
  onParamsChange: (params: any) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onParamsChange }) => {
  const [lerpFactor, setLerpFactor] = useState(0.02);
  
  const handleLerpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLerpFactor(value);
    onParamsChange({ lerpFactor: value });
  };

  return (
    <div className="control-panel">
      <label>
        Lerp Factor: {lerpFactor}
        <input
          type="range"
          min="0.001"
          max="0.1"
          step="0.001"
          value={lerpFactor}
          onChange={handleLerpChange}
        />
      </label>
    </div>
  );
};
```

### Step 2: Update App.tsx

```tsx
function App() {
  const [activeTab, setActiveTab] = useState<InteractionType>('magnet');
  const [magnetParams, setMagnetParams] = useState({});

  return (
    <div className="w-full h-full flex flex-col">
      <MenuBar activeTab={activeTab} onTabChange={setActiveTab} />
      <ControlPanel onParamsChange={setMagnetParams} />
      <div className="flex-1">
        <LinesMagnet {...magnetParams} />
      </div>
    </div>
  );
}
```

## Parameter Categories

### Grid & Layout
- `gridRowHeight`, `gridColWidth`: Control the density of lines
- Smaller values = more lines, denser grid

### Animation & Timing
- `spinSpeed`, `growDuration`, `shrinkDelay`: Control animation speeds
- `lerpFactor`, `lerpWidth`: Control smoothing/lag in movements

### Interaction
- `interactionRadius`, `maxRadius`, `minRadius`: Mouse influence area
- `radiusGrowthRate`: How fast radius grows on mouse hold
- `maxMoveDistance`: Maximum line movement distance

### Visual
- `lineColor`, `backgroundColor`: Color schemes
- `lineWidth`, `lineHeight`: Line dimensions
- `color1`, `color2`: Gradient colors (for color variants)

## Common Patterns

### Adding a New Interaction

1. **Create Component File**
```tsx
// src/components/interactions/MyNewInteraction.tsx
export interface MyNewInteractionConfig {
  // Define parameters
}

export const MyNewInteraction: React.FC<MyNewInteractionConfig> = ({
  // Destructure with defaults
}) => {
  // Implementation
};
```

2. **Add to MenuBar**
```tsx
// src/components/MenuBar.tsx
export type InteractionType = 
  | 'magnet'
  | 'my-new-interaction'; // Add here

const tabs = [
  // ... existing tabs
  { id: 'my-new-interaction', label: 'My New' },
];
```

3. **Add to App Switch**
```tsx
// src/App.tsx
case 'my-new-interaction':
  return <MyNewInteraction />;
```

### Preset System

```tsx
// src/presets/magnetPresets.ts
export const magnetPresets = {
  subtle: {
    interactionRadius: 500,
    lerpFactor: 0.01,
    baseEffectStrength: 0.3,
  },
  intense: {
    interactionRadius: 3000,
    lerpFactor: 0.08,
    baseEffectStrength: 1.0,
  },
};

// Usage in component
<LinesMagnet {...magnetPresets.subtle} />
```

### Save/Load Configuration

```tsx
// Save configuration
const saveConfig = (config: any) => {
  localStorage.setItem('linesMagnetConfig', JSON.stringify(config));
};

// Load configuration
const loadConfig = () => {
  const saved = localStorage.getItem('linesMagnetConfig');
  return saved ? JSON.parse(saved) : {};
};
```

## Performance Tips

1. **Limit Line Count**: For Spread Color, limit is set to 2000 lines maximum
2. **Cache Positions**: Line positions are cached after rendering to avoid expensive `getBoundingClientRect` calls
3. **RAF Optimization**: Use single `requestAnimationFrame` loop per component
4. **Cleanup**: Always cancel animation frames in cleanup function

## Touch Support

Components with touch support:
- LinesMagnet (full touch support)
- LinesSpreadColor (full touch support)

Add touch support to other components:
```tsx
window.addEventListener('touchstart', handleTouchStart, { passive: false });
window.addEventListener('touchmove', handleTouchMove);
window.addEventListener('touchend', handleTouchEnd);
```

## Future Enhancements

### Recommended Features

1. **Control Panel UI**
   - Sliders for numeric parameters
   - Color pickers for colors
   - Toggle switches for boolean flags
   - Reset to defaults button

2. **Preset Management**
   - Dropdown to select presets
   - Save custom presets
   - Import/Export functionality

3. **Animation Recording**
   - Record interactions as video
   - Export as GIF
   - Screenshot capture

4. **Mobile Optimization**
   - Reduce line count on mobile
   - Touch-optimized controls
   - Responsive menu bar

5. **Parameter Randomization**
   - "Surprise me" button
   - Random parameter generation
   - Lock/unlock individual parameters

## Debugging

### Enable Debug Mode

Add debug props to components:
```tsx
interface Config {
  debug?: boolean;
}

// In component
if (debug) {
  console.log('Current params:', { radius, lerp, ... });
}
```

### Performance Monitoring

```tsx
const frameTimeRef = useRef<number[]>([]);

// In animation loop
const frameTime = performance.now() - lastTime;
frameTimeRef.current.push(frameTime);

// Log average frame time
console.log('Avg frame time:', 
  frameTimeRef.current.reduce((a, b) => a + b) / frameTimeRef.current.length
);
```

## Conclusion

All components are production-ready with:
- ✅ Full parameterization
- ✅ TypeScript type safety
- ✅ Proper React lifecycle management
- ✅ Performance optimization
- ✅ Clean code structure
- ✅ Comprehensive documentation

Ready for parameter controls, presets, and advanced features!

