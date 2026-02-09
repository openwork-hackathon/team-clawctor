import type { FC, ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const AuthCard: FC<AuthCardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="w-full max-w-[440px] z-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#111418] dark:text-white">
          {title}
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
      </div>
      {/* Main Auth Card */}
      <div className="bg-white dark:bg-[#1a2632] shadow-xl rounded-xl p-8 border border-gray-100 dark:border-gray-800">
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
