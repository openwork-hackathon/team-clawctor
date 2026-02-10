import type { FC } from 'react';
import { Header, Footer } from '../components/layout';
import {
  HeroSection,
  FeaturesSection,
  ReportPreviewSection,
  HowItWorksSection,
  SkillInstallSection,
} from '../components/landing';

export const LandingPage: FC = () => {

  const handleStartAuditClick = () => {
    console.log('Start audit clicked');
  };

  return (
    <>
      <Header
      />
      <main className="pt-24">
        <HeroSection
          onStartAuditClick={handleStartAuditClick}
        />
        <FeaturesSection />
        <ReportPreviewSection />
        <HowItWorksSection />
        <SkillInstallSection />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
