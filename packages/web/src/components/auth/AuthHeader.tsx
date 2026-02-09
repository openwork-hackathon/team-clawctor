import type { FC } from 'react';

export const AuthHeader: FC = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-800 px-6 md:px-10 py-4 bg-white dark:bg-background-dark z-10">
      <a href="/" className="flex items-center gap-2 text-[#111418] dark:text-white">
        <div className="text-primary flex items-center">
          <span className="material-symbols-outlined text-2xl leading-none">shield</span>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
          Clawctor <span className="text-primary">AI</span>
        </h2>
      </a>
      <div className="hidden md:flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <a
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
            href="#"
          >
            Security Portal
          </a>
          <a
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
            href="#"
          >
            System Status
          </a>
          <a
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
            href="#"
          >
            Docs
          </a>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
