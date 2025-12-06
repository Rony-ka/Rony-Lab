import React from 'react';
import { MenuTheme } from './MenuBar';

interface SpacingSliderProps {
  value: number;
  onChange: (value: number) => void;
  theme: MenuTheme;
  min?: number;
  max?: number;
  defaultValue?: number;
}

export const SpacingSlider: React.FC<SpacingSliderProps> = ({
  value,
  onChange,
  theme,
  min = 10,
  max = 70,
  defaultValue = 20,
}) => {
  const isDark = theme === 'dark';
  const middleValue = defaultValue;

  // Convert actual value to slider position (non-linear scale)
  const valueToSlider = (val: number): number => {
    if (val <= middleValue) {
      // Map 10-20 to 0-50
      return ((val - min) / (middleValue - min)) * 50;
    } else {
      // Map 20-60 to 50-100
      return 50 + ((val - middleValue) / (max - middleValue)) * 50;
    }
  };

  // Convert slider position to actual value (non-linear scale)
  const sliderToValue = (sliderVal: number): number => {
    if (sliderVal <= 50) {
      // Map 0-50 to 10-20
      return min + (sliderVal / 50) * (middleValue - min);
    } else {
      // Map 50-100 to 20-60
      return middleValue + ((sliderVal - 50) / 50) * (max - middleValue);
    }
  };

  const sliderValue = valueToSlider(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSliderValue = Number(e.target.value);
    const newValue = sliderToValue(newSliderValue);
    onChange(Math.round(newValue));
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  return (
    <>
      <div className="flex gap-[8px] items-center px-0 sm:px-[8px] py-3 sm:py-[3px] rounded-[10px] w-full sm:w-auto sm:h-[34px] justify-center my-2 sm:my-0">
        <input
          type="range"
          min={0}
          max={100}
          value={sliderValue}
          onChange={handleChange}
          onDoubleClick={handleDoubleClick}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="slider w-full sm:w-[180px]"
          style={{
            height: '4px',
            borderRadius: '2px',
            appearance: 'none',
            WebkitAppearance: 'none',
            background: isDark
              ? `linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) ${sliderValue}%, rgba(255,255,255,0.1) ${sliderValue}%, rgba(255,255,255,0.1) 100%)`
              : `linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.3) ${sliderValue}%, rgba(0,0,0,0.1) ${sliderValue}%, rgba(0,0,0,0.1) 100%)`,
            outline: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      </div>
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #333333;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-webkit-slider-thumb:hover {
          background: #333333;
          transform: scale(1.15);
        }
        .slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #333333;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb:hover {
          background: #333333;
          transform: scale(1.15);
        }
        .slider::-moz-range-thumb:active {
          transform: scale(1.05);
        }
        @media (max-width: 640px) {
          .slider::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
          }
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </>
  );
};

