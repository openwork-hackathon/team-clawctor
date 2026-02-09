import type { FC } from 'react';

interface HeroSectionProps {
  onStartAuditClick?: () => void;
  onBookDemoClick?: () => void;
}

export const HeroSection: FC<HeroSectionProps> = ({
  onStartAuditClick,
  onBookDemoClick,
}) => {
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
            <span className="material-symbols-outlined text-sm">verified</span>
            Powered by OpenClaw Engine
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-[-0.033em]">
            AI-Driven Security Auditing for the{' '}
            <span className="text-primary">OpenClaw</span> Ecosystem
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-[540px]">
            Automate your system health checkups and security audits with our
            advanced AI engine, designed specifically for seamless OpenClaw
            infrastructure integration.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onStartAuditClick}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-base font-bold shadow-xl shadow-primary/25 transition-all"
            >
              Start Your Free Audit
            </button>
            <button
              onClick={onBookDemoClick}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl text-base font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Book a Demo
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
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
            Trusted by 500+ Engineering Teams
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
            <div
              className="rounded-2xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative group"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMOhGtKOZD8L8ix4pHgM7cAGyPCjD6EVMhsNhm-lzTCB11kuLP_-1tgE48sShLhKrnKYXwHuqoK3KtL829_O4cIbPelA-0HgVpD6prOvp-4UeO0QokSXne5EC2c7nEDKU0lyZIutEP2jQ4LbMi1jaAOqfuHRZeMbIfX8-ldXu_nFT9r3Dh-J8rEspIgC-AgatBSoNSXnWu1s1m1BGodjB4JoBF2efkylVbF_b_45JKbCxLyfakLk4HgoCpy87HrMi7IP6sE31tAUI")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
              <span className="material-symbols-outlined text-6xl text-primary/40 group-hover:scale-110 transition-transform">
                analytics
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
