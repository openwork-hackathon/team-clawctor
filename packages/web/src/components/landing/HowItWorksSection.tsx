import type { FC } from 'react';

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Integrate OpenClaw',
    description: 'Connect your ecosystem via our secure API in just two clicks.',
  },
  {
    number: 2,
    title: 'Submit System Data',
    description:
      'Run the automated scanner or fill out intelligent questionnaires.',
  },
  {
    number: 3,
    title: 'Get AI Report',
    description:
      'Download your comprehensive health report and security roadmap.',
  },
];

export const HowItWorksSection: FC = () => {
  return (
    <section
      className="py-24 bg-background-light dark:bg-background-dark"
      id="how-it-works"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Simple 3-Step Process</h2>
        </div>
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-white dark:bg-gray-800 border-2 border-primary rounded-full flex items-center justify-center text-primary font-black text-xl mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
