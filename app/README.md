# Lines Interactive Platform

A React + TypeScript + Tailwind CSS platform featuring 7 interactive line visualizations with a Cursor-inspired menu bar.

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open automatically in your browser at `http://localhost:3000`.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
app/
├── src/
│   ├── components/
│   │   ├── MenuBar.tsx              # Cursor-inspired navigation bar
│   │   └── interactions/
│   │       ├── LinesMagnet.tsx      # Magnetic rotation effect
│   │       ├── LinesPianoBW.tsx     # Piano effect (B&W)
│   │       ├── LinesPianoColor.tsx  # Piano effect (Color)
│   │       ├── LinesRotationBW.tsx  # Rotation effect (B&W)
│   │       ├── LinesRotationColor.tsx # Rotation effect (Color)
│   │       ├── LinesSpreadBW.tsx    # Spread effect (B&W)
│   │       └── LinesSpreadColor.tsx # Spread effect (Color)
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global styles & Tailwind
├── index.html                       # HTML template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.js               # Tailwind config
└── vite.config.ts                   # Vite config
```

## 🎨 Interactive Components

Each interaction component is fully parameterized and ready for future control panels. All components accept configuration props with sensible defaults:

### 1. Lines Magnet
Magnetic rotation effect where lines rotate to follow the cursor with smooth interpolation.

**Configurable Parameters:**
- Grid dimensions
- Interaction radius
- Lerp factors (smoothing)
- Effect strength
- Colors and line dimensions

### 2. Piano B&W
Lines grow and shrink with hover and click-drag radius effects (Black & White).

**Configurable Parameters:**
- Animation durations
- Scale factors
- Radius growth rates
- Line styling

### 3. Piano Color
Similar to Piano B&W but with color transitions (Purple to Red).

**Configurable Parameters:**
- Colors (active and growing states)
- Animation timings
- Line dimensions

### 4. Rotation B&W
Lines spin continuously on hover (Black & White).

**Configurable Parameters:**
- Spin speed
- Ease-out delay
- Line thickness
- Grid spacing

### 5. Rotation Color
Spinning lines with animated color and thickness changes.

**Configurable Parameters:**
- Two-color gradient
- Animation speed
- Radius effects on mouse down

### 6. Spread B&W
Lines spread horizontally away from cursor (Black & White).

**Configurable Parameters:**
- Maximum spread distance
- Interaction radius
- Growth rate on mouse hold

### 7. Spread Color
Lines spread with width and color changes (Purple to Red gradient).

**Configurable Parameters:**
- Color gradient (RGB)
- Width ranges
- Lerp factors for smooth transitions
- Touch support enabled

## 🎛️ Future Enhancements

All components are designed with parameterization in mind. You can easily add:

- Control panels with sliders for real-time parameter adjustment
- Preset configurations
- Save/Load functionality
- Export interactions as standalone files
- Parameter randomization
- Mobile-specific touch optimizations

## 🛠️ Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Custom Properties** - Dynamic styling
- **RequestAnimationFrame** - Smooth animations

## 📝 Notes

- All interactions use pure JavaScript/TypeScript for animations (no external animation libraries)
- Performance optimized with RAF (requestAnimationFrame) and cached positions
- Proper cleanup on component unmount
- Responsive and resizes with viewport
- Touch event support for mobile devices (where implemented)

## 🎯 Adding New Interactions

1. Create a new component in `src/components/interactions/`
2. Define an interface for configuration props
3. Use `useEffect` and `useRef` for DOM manipulation
4. Export default parameters
5. Add to `App.tsx` switch statement
6. Add tab to `MenuBar.tsx`

Enjoy creating with Lines Interactive Platform! 🎨✨

