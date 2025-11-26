# Quick Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation Steps

### 1. Navigate to the app directory

```bash
cd "/Users/ronykaradi/Desktop/Code/K's Lab/app"
```

### 2. Install dependencies

```bash
npm install
```

This will install:
- React 18
- Vite (build tool)
- TypeScript
- Tailwind CSS
- All necessary dev dependencies

### 3. Start the development server

```bash
npm run dev
```

The app will automatically open in your browser at `http://localhost:3000`.

### 4. Start exploring!

Use the menu bar at the top to switch between different line interactions:
- **Magnet** - Lines rotate to follow your cursor
- **Piano B&W** - Lines grow on hover/click with staggered animations
- **Piano Color** - Colorful version with purple/red transitions
- **Rotation B&W** - Lines spin continuously on hover
- **Rotation Color** - Spinning lines with color animations
- **Spread B&W** - Lines spread away from cursor
- **Spread Color** - Lines spread with colorful gradients

## Build for Production

```bash
npm run build
```

The optimized build will be created in the `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Vite will automatically try the next available port (3001, 3002, etc.).

### TypeScript Errors

Make sure you're using Node.js v16 or higher:

```bash
node --version
```

### Module Not Found

Delete `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Edit interaction parameters in the component files
- Add new interactions by creating new components
- Implement control panels for real-time parameter adjustment
- Customize the menu bar styling in `MenuBar.tsx`

Happy coding! 🚀



