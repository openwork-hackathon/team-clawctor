import type { FC } from 'react';

interface CTASectionProps {
  onGetStartedClick?: () => void;
  onContactSalesClick?: () => void;
}

export const CTASection: FC<CTASectionProps> = ({
  onGetStartedClick,
  onContactSalesClick,
}) => {
  return (
    <section className="py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-primary rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[300px] -rotate-12 absolute -top-20 -left-20">
              shield
            </span>
            <span className="material-symbols-outlined text-[200px] rotate-12 absolute -bottom-20 -right-20">
              security
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to secure your AI future?
            </h2>
            <p className="text-xl mb-10 text-white/80 max-w-xl mx-auto">
              Join hundreds of enterprises using Clawctor to protect their
              critical infrastructure.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onGetStartedClick}
                className="bg-white text-primary hover:bg-gray-100 px-10 py-4 rounded-xl text-lg font-bold transition-all"
              >
                Get Started Free
              </button>
              <button
                onClick={onContactSalesClick}
                className="bg-primary/20 hover:bg-primary/30 text-white border border-white/30 px-10 py-4 rounded-xl text-lg font-bold transition-all"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
