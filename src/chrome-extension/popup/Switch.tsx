import React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, className = '' }) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ease-in-out duration-200 ${
        checked ? 'bg-green-500' : 'bg-gray-200'
      } ${className}`}
    >
      <span className="sr-only">{checked ? 'Disable' : 'Enable'}</span>
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export default Switch;
