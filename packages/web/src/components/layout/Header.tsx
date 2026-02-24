import type { FC } from 'react';

interface HeaderProps {
  onStartTrialClick?: () => void;
}

export const Header: FC<HeaderProps> = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#f0f2f4] dark:border-gray-800">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="text-primary flex items-center">
            <span className="material-symbols-outlined text-3xl leading-none">shield</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Clawctor <span className="text-primary">AI</span>
          </h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a
            className="text-sm font-semibold hover:text-primary transition-colors"
            href="#features"
          >
            Features
          </a>
          <a
            className="text-sm font-semibold hover:text-primary transition-colors"
            href="#how-it-works"
          >
            How it Works
          </a>
          <a
            className="text-sm font-semibold hover:text-primary transition-colors"
            href="#docs"
          >
            Docs
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
