import type { FC } from 'react';

export type AuthMode = 'login' | 'signup';

interface AuthToggleProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export const AuthToggle: FC<AuthToggleProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex h-11 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-8">
      <button
        type="button"
        onClick={() => onModeChange('login')}
        className={`flex h-full grow items-center justify-center rounded-md px-2 text-sm font-semibold transition-all ${
          mode === 'login'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white'
            : 'text-gray-500 dark:text-gray-400 hover:text-primary'
        }`}
      >
        <span>Login</span>
      </button>
      <button
        type="button"
        onClick={() => onModeChange('signup')}
        className={`flex h-full grow items-center justify-center rounded-md px-2 text-sm font-semibold transition-all ${
          mode === 'signup'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white'
            : 'text-gray-500 dark:text-gray-400 hover:text-primary'
        }`}
      >
        <span>Sign Up</span>
      </button>
    </div>
  );
};

export default AuthToggle;
