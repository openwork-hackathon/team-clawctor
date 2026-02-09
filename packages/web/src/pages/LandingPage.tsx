import type { FC } from 'react';
import { Header, Footer } from '../components/layout';
import {
  HeroSection,
  FeaturesSection,
  ReportPreviewSection,
  HowItWorksSection,
  SkillInstallSection,
  CTASection,
} from '../components/landing';

export const LandingPage: FC = () => {

  const handleStartAuditClick = () => {
    console.log('Start audit clicked');
    // TODO: Navigate to audit start flow
  };

  const handleBookDemoClick = () => {
    console.log('Book demo clicked');
    // TODO: Open demo booking modal or navigate
  };

  return (
    <>
      <Header
      />
      <main className="pt-24">
        <HeroSection
          onStartAuditClick={handleStartAuditClick}
          onBookDemoClick={handleBookDemoClick}
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
