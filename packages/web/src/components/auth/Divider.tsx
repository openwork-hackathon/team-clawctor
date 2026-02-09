import type { FC } from 'react';

interface DividerProps {
  text?: string;
}

export const Divider: FC<DividerProps> = ({ text = 'or' }) => {
  return (
    <div className="relative flex items-center justify-center mb-6">
      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
      <span className="flex-shrink mx-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
        {text}
      </span>
      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
    </div>
  );
};

export default Divider;
