import type { FC } from 'react';

export const BackgroundPattern: FC = () => {
  return (
    <>
      {/* Background Grid Pattern for "System" feel */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#137fec 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Decorative Illustration (Right-side abstract) */}
      <div className="hidden xl:block fixed right-[-10%] top-1/2 -translate-y-1/2 w-[400px] h-[600px] opacity-20 pointer-events-none">
        <div
          className="w-full h-full bg-gradient-to-br from-primary to-blue-300 rounded-full blur-[100px]"
          aria-hidden="true"
        />
      </div>
    </>
  );
};

export default BackgroundPattern;
