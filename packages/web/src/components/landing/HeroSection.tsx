import type { FC } from 'react';

interface HeroSectionProps {
  onStartAuditClick?: () => void;}

export const HeroSection: FC<HeroSectionProps> = ({
  onStartAuditClick,
}) => {
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-20 md relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* Left Content */}
        <div className="w-full lg:w-[55%] flex flex-col gap-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
            <span className="material-symbols-outlined text-sm">verified</span>
            Powered by Clawctor Engine
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
            AI-Driven Security Auditing for the{' '}
            <span className="text-primary">OpenClaw</span> Ecosystem
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-[580px]">
            Automate your system health checkups and security audits with our
            advanced AI engine, designed specifically for seamless OpenClaw
            infrastructure integration.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onStartAuditClick}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-base font-bold shadow-xl shadow-primary/25 transition-all"
            >
              Start OpenClaw Audit
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 pt-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                JD
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-200 flex items-center justify-center text-[10px] font-bold">
                AS
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-green-200 flex items-center justify-center text-[10px] font-bold">
                MK
              </div>
            </div>
            Trusted by Engineering Teams
          </div>
        </div>

        {/* Right Visual - New Design */}
        <div className="w-full lg:w-[40%] relative flex items-center justify-center">
          <div className="relative w-full max-w-[420px] aspect-square group">
            {/* Outer glow */}
            <div className="absolute -inset-16 bg-gradient-to-r from-primary/20 via-cyan-400/15 to-blue-600/20 rounded-full blur-[60px] opacity-60 dark:opacity-40"></div>

            {/* Main container */}
            <div className="relative bg-white dark:bg-gray-800/40 p-2 rounded-[2.5rem] shadow-2xl border border-white/20 backdrop-blur-md">
              <div className="rounded-[2rem] overflow-hidden aspect-square bg-slate-950 flex items-center justify-center relative">
                {/* Mesh background */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(19, 127, 236, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(19, 127, 236, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                  }}
                ></div>

                {/* Inner content */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  {/* Rotating dashed circle */}
                  <div className="absolute w-[85%] h-[85%] rounded-full border-8 border-primary/30 border-dashed animate-spin-slow"></div>

                  {/* Center glow */}
                  <div className="absolute w-[60%] h-[60%] bg-primary/20 rounded-full blur-[40px]"></div>

                  {/* Shield icon */}
                  <div className="relative flex items-center justify-center w-[70%] h-[70%]">
                    <div className="absolute inset-0 scale-[2.5] bg-cyan-400/20 blur-3xl rounded-full"></div>
                    <span
                      className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-primary to-blue-600 drop-shadow-[0_0_50px_rgba(19,127,236,0.7)]"
                      style={{
                        fontSize: '240px',
                        fontVariationSettings: "'FILL' 1, 'wght' 200, 'opsz' 48",
                        lineHeight: 1,
                      }}
                    >
                      verified_user
                    </span>
                  </div>

                  {/* Decorative dots */}
                  <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee]"></div>
                  <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                  <div className="absolute top-1/2 left-10 w-4 h-4 border border-primary/50 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  </div>

                  {/* SVG lines */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-40"
                    viewBox="0 0 400 400"
                  >
                    <path
                      d="M100 100 L300 300 M300 100 L100 300"
                      fill="none"
                      stroke="url(#heroGrad1)"
                      strokeWidth="0.5"
                    />
                    <defs>
                      <linearGradient
                        id="heroGrad1"
                        x1="0%"
                        x2="100%"
                        y1="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: '#22d3ee', stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: '#137fec', stopOpacity: 1 }}
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Bottom status bar */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20">
                  <div className="flex flex-col gap-1">
                    <div className="h-1 w-20 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-3/4"></div>
                    </div>
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">
                      Integrity: 100%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
